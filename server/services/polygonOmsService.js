const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const logger = require('../utils/logger');

class PolygonOmsService {
  constructor() {
    this.baseUrl = process.env.POLYGON_OMS_BASE_URL || 'https://sandbox-api.polygon.technology/v0.11';
    this.apiKey = process.env.POLYGON_OMS_API_KEY || '';
    this.apiSecret = process.env.POLYGON_OMS_API_SECRET || '';
    this.accessToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Get valid Bearer token for Polygon OMS API
   */
  async getBearerToken() {
    if (this.accessToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    if (!this.apiKey || !this.apiSecret) {
      logger.info('Polygon OMS API credentials not configured, operating in Sandbox Simulation Mode.');
      return 'simulated_bearer_token';
    }

    try {
      const response = await axios.post(`${this.baseUrl}/auth/token`, {
        apiKey: this.apiKey,
        apiSecret: this.apiSecret
      });

      this.accessToken = response.data.accessToken;
      // Set expiration 60 seconds before actual expiry
      const expiresInMs = (response.data.expiresIn || 86400) * 1000;
      this.tokenExpiresAt = new Date(Date.now() + expiresInMs - 60000);

      logger.info('Successfully obtained Polygon OMS Bearer token.');
      return this.accessToken;
    } catch (err) {
      logger.error('Failed to authenticate with Polygon OMS API:', err.response?.data || err.message);
      return 'simulated_bearer_token';
    }
  }

  /**
   * Helper for authorized HTTP requests to Polygon OMS
   */
  async request(method, endpoint, data = null, params = null) {
    const token = await this.getBearerToken();

    if (token === 'simulated_bearer_token') {
      return this.handleSimulatedRequest(method, endpoint, data, params);
    }

    const config = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': uuidv4()
      },
      data,
      params
    };

    try {
      const res = await axios(config);
      return res.data;
    } catch (err) {
      logger.error(`OMS Request Error [${method} ${endpoint}]:`, err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.response?.data?.error || err.message);
    }
  }

  /**
   * Create Customer with full KYC identity
   */
  async createCustomer(customerData) {
    const payload = {
      type: 'individual',
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone || '+12125551234',
      birthDate: customerData.birthDate || '1995-06-15',
      residentialAddress: customerData.residentialAddress || {
        line1: '100 Financial Way',
        city: 'New York',
        state: 'NY',
        country: 'US',
        zipCode: '10005'
      },
      identifyingInformation: customerData.identifyingInformation || [
        { type: 'ssn', issuingCountry: 'US', number: '123456789' }
      ]
    };

    return await this.request('POST', '/customers', payload);
  }

  /**
   * Get Customer Details & KYC Status
   */
  async getCustomer(customerId) {
    return await this.request('GET', `/customers/${customerId}`);
  }

  /**
   * Provision Custodial USDC Wallet on Polygon
   */
  async createWallet(customerId, asset = 'usdc', chain = 'polygon') {
    return await this.request('POST', `/customers/${customerId}/wallets`, {
      asset,
      chain
    });
  }

  /**
   * Get Customer Balance
   */
  async getBalance(customerId) {
    return await this.request('GET', `/customers/${customerId}/balance`);
  }

  /**
   * Search Retail Cash Locations
   */
  async getCashLocations(lat = 40.7128, lng = -74.0060, provider = 'retail') {
    return await this.request('GET', '/cash-locations', null, {
      latitude: lat,
      longitude: lng,
      provider
    });
  }

  /**
   * Generate Cash-In Barcode Deposit Code
   */
  async createCashIn(customerId, amount, destinationWalletId) {
    return await this.request('POST', '/cash-ins', {
      customerId,
      amount: String(amount),
      currency: 'usd',
      destinationWalletId
    });
  }

  /**
   * Create US Virtual Bank Account (ACH/Wire Inbound)
   */
  async createVirtualAccount(customerId, destinationWalletId) {
    return await this.request('POST', '/virtual-accounts', {
      customerId,
      source: { asset: 'usd', network: 'usBank' },
      destination: {
        type: 'walletOms',
        details: { id: destinationWalletId }
      },
      accountHolder: 'customer',
      type: 'bankUs'
    });
  }

  /**
   * Register External Bank Account (Outbound Payout)
   */
  async createExternalAccount(customerId, bankDetails) {
    return await this.request('POST', '/external-accounts', {
      owner: { kind: 'customer', customerId },
      type: 'bankUs',
      bankUs: {
        accountNumber: bankDetails.accountNumber || '987654321',
        routingNumber: bankDetails.routingNumber || '021000021',
        accountType: bankDetails.accountType || 'checking'
      }
    });
  }

  /**
   * Request Quote for P2P Transfer or Bank Payout
   */
  async createQuote(customerId, sourceWalletId, destination, sponsorGas = true) {
    const payload = {
      customerId,
      source: {
        walletId: sourceWalletId,
        asset: 'usdc',
        network: 'polygon'
      },
      destination: destination.blockchainAddress ? {
        blockchainAddress: destination.blockchainAddress,
        asset: 'usdc',
        network: 'polygon'
      } : {
        externalAccountId: destination.externalAccountId,
        asset: 'usd',
        network: 'usBank'
      },
      sponsorGas
    };

    return await this.request('POST', '/quotes', payload);
  }

  /**
   * Execute Transaction Against Quote
   */
  async executeTransaction(quoteId) {
    return await this.request('POST', '/transactions', { quoteId });
  }

  /**
   * Simulated Response Handler for Development / Sandbox testing without credentials
   */
  handleSimulatedRequest(method, endpoint, data, params) {
    logger.info(`[OMS Simulation Mode] ${method} ${endpoint}`);

    if (endpoint === '/customers' && method === 'POST') {
      const cstId = `cst_${uuidv4().substring(0, 8)}`;
      return {
        id: cstId,
        type: 'individual',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        endorsements: [
          { name: 'basic', status: 'ACTIVE' },
          { name: 'cryptoCustody', status: 'ACTIVE' },
          { name: 'usd', status: 'ACTIVE' }
        ],
        createdAt: new Date().toISOString()
      };
    }

    if (endpoint.includes('/wallets') && method === 'POST') {
      return {
        id: `wlt_${uuidv4().substring(0, 8)}`,
        address: `0x${uuidv4().replace(/-/g, '').substring(0, 40)}`,
        asset: 'usdc',
        chain: 'polygon',
        createdAt: new Date().toISOString()
      };
    }

    if (endpoint.includes('/balance')) {
      return {
        availableBalance: '2450.00',
        pendingBalance: '0.00',
        currency: 'USD',
        asset: 'USDC',
        network: 'polygon'
      };
    }

    if (endpoint === '/cash-locations') {
      return {
        data: [
          { locId: 'loc_771', name: '7-Eleven Store #14092', address: '742 Broadway, NY', cashLocationReference: 'ref_771', distanceMiles: 0.2 },
          { locId: 'loc_882', name: 'CVS Pharmacy #3310', address: '500 Grand St, NY', cashLocationReference: 'ref_882', distanceMiles: 0.5 },
          { locId: 'loc_993', name: 'Walmart MoneyCenter', address: '120 E 14th St, NY', cashLocationReference: 'ref_993', distanceMiles: 1.1 }
        ]
      };
    }

    if (endpoint === '/cash-ins' && method === 'POST') {
      return {
        id: `csh_${uuidv4().substring(0, 8)}`,
        customerId: data.customerId,
        amount: data.amount,
        currency: 'USD',
        barcodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=POLYGON-OMS-CASHIN-' + uuidv4().substring(0, 8),
        depositCode: `3892-0194-${Math.floor(1000 + Math.random() * 9000)}`,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      };
    }

    if (endpoint === '/virtual-accounts' && method === 'POST') {
      return {
        id: `va_${uuidv4().substring(0, 8)}`,
        customerId: data.customerId,
        accountHolder: 'customer',
        type: 'bankUs',
        bankDetails: {
          accountNumber: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
          routingNumber: '021000021',
          bankName: 'Polygon Open Money Bank (Evolve Bank & Trust)',
          accountType: 'checking'
        },
        status: 'active'
      };
    }

    if (endpoint === '/external-accounts' && method === 'POST') {
      return {
        id: `ext_bankUs_${uuidv4().substring(0, 8)}`,
        owner: data.owner,
        type: 'bankUs',
        status: 'active',
        bankUs: data.bankUs
      };
    }

    if (endpoint === '/quotes' && method === 'POST') {
      return {
        id: `qt_${uuidv4().substring(0, 8)}`,
        exchangeRate: '1.00',
        fee: '0.00',
        sponsorGas: true,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      };
    }

    if (endpoint === '/transactions' && method === 'POST') {
      return {
        id: `txn_${uuidv4().substring(0, 8)}`,
        quoteId: data.quoteId,
        status: 'completed',
        txHash: `0x${uuidv4().replace(/-/g, '')}`,
        completedAt: new Date().toISOString()
      };
    }

    return { success: true, mock: true, endpoint };
  }
}

module.exports = new PolygonOmsService();
