class DocumentAnalysisService {
  async summarize(id, b) { return { summary: 'Mock summary' }; }
  async classify(id, b) { return { category: 'Invoice' }; }
  async compare(id1, id2) { return { similarity: 90 }; }
  async detectTampering(id, b) { return { tampered: false }; }
}
module.exports = DocumentAnalysisService;
