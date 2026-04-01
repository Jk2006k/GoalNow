const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');

async function test() {
  await mongoose.connect('mongodb+srv://kishoore:9876@intbar.kbya4v4.mongodb.net/goalnow');
  const user = await User.findOne({ resume: { $ne: null } }).sort({updatedAt: -1});
  if (!user || !user.resume) {
    console.log("No resume");
    return process.exit(0);
  }
  console.log("Found resume length:", user.resume.length);
  const base64Data = user.resume.split(',')[1] || user.resume;
  try {
    const pdftool = require('pdf-parse');
    const buffer = Buffer.from(base64Data, 'base64');
    let text = "";

    if (pdftool && typeof pdftool.PDFParse === 'function') {
      const parser = new pdftool.PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text || "";
      await parser.destroy();
    } else {
      const parseFunc = (typeof pdftool === 'function') ? pdftool : (pdftool.default || pdftool);
      const data = await parseFunc(buffer);
      text = data?.text || "";
    }
    
    console.log("Parsed PDF length:", text.length);
    console.log("Snippet:", text.substring(0, 100));
  } catch (e) {
    console.error("PDF Parse error:", e);
  }
  process.exit(0);
}
test();
