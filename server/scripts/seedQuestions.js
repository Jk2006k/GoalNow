/**
 * Seed script for populating question database
 * Run with: node server/scripts/seedQuestions.js
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Question = require("../models/Question");
const questions = require("../data/questions");

const seedQuestions = async () => {
  try {
    console.log("🌱 Starting to seed questions...\n");

    // Clear existing questions
    const deleted = await Question.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing questions\n`);

    // Insert questions
    const result = await Question.insertMany(questions);
    console.log(`✅ Successfully seeded ${result.length} questions:\n`);

    result.forEach((question, index) => {
      console.log(`${index + 1}. ${question.title}`);
      console.log(`   Difficulty: ${question.difficulty}`);
      console.log(`   Test Cases: ${question.testCases.length}`);
      console.log(`   Hidden Test Cases: ${question.hiddenTestCases.length}`);
      console.log(`   Tags: ${question.tags.join(", ")}\n`);
    });

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding questions:", error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run seeding
seedQuestions();
