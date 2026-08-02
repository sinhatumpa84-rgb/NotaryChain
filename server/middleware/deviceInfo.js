const UAParser = require('ua-parser-js');

exports.extractDeviceInfo = (req, res, next) => {
  const p = new UAParser(req.headers['user-agent']);
  const r = p.getResult();
  req.deviceInfo = {
    ipAddress: req.headers['x-forwarded-for'] || req.ip,
    browser: r.browser.name,
    browserVersion: r.browser.version,
    os: r.os.name,
    osVersion: r.os.version,
    device: r.device.model,
    deviceType: r.device.type || 'desktop',
    screenResolution: req.headers['x-screen-resolution'],
    location: req.headers['x-location'] ? JSON.parse(req.headers['x-location']) : null,
    userAgent: req.headers['user-agent']
  };
  next();
};
