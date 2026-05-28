function lastUserMessage(messages = []) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === "user") {
      return String(messages[index].content || "");
    }
  }

  return "";
}

function standardIntro(denomination) {
  if (denomination === "Catholic") {
    return "From a Catholic perspective,";
  }

  if (denomination === "Orthodox") {
    return "From an Orthodox perspective,";
  }

  if (denomination === "Baptist") {
    return "From a Baptist perspective,";
  }

  if (denomination === "Non-denominational") {
    return "Speaking broadly and Scripture-first,";
  }

  return "From a Protestant perspective,";
}

function sharedScripture() {
  return "|||SCRIPTURE|||Trust in the Lord with all your heart and lean not on your own understanding.|||REF|||Proverbs 3:5-6|||END|||";
}

export function buildDemoReply({ messages = [], denomination = "Protestant" }) {
  const latest = lastUserMessage(messages);
  const text = latest.toLowerCase();
  const intro = standardIntro(denomination);

  if (/(image|picture|art|illustration|draw|generate)/.test(text)) {
    return `${intro} here is a reverent Christian image concept centered on peace, hope, and biblical symbolism. |||IMAGE|||a peaceful nativity scene with soft candlelight, worshipful atmosphere, warm gold and blue tones, reverent faces, realistic painterly detail|||ENDIMAGE|||`;
  }

  if (/john 3:16/.test(text) && /help themselves/.test(text)) {
    return `${intro} that phrase is not part of John 3:16. The verse actually emphasizes God's love and the gift of eternal life through Jesus Christ. ${sharedScripture()} If you want, I can also explain how different Christian traditions read this passage.`;
  }

  if (/hezekiah 4:8/.test(text)) {
    return `${intro} there is no book of Hezekiah in the Bible, so that citation is incorrect. A better approach is to check the book name, chapter, and verse carefully. ${sharedScripture()}`;
  }

  if (/psalm 151/.test(text)) {
    return `${intro} Psalm 151 is not in the Protestant canon, though it is present in some Orthodox and related traditions. ${sharedScripture()} If you'd like, I can compare how the canon differs across traditions.`;
  }

  if (/salvation|faith alone|works/.test(text)) {
    return `${intro} Christians answer this differently across traditions. Protestants usually stress justification by faith apart from works, while Catholics and Orthodox emphasize that living faith is expressed through grace-enabled obedience and transformation. ${sharedScripture()}`;
  }

  if (/pope infallible/.test(text)) {
    return `${intro} Catholics teach papal infallibility only under specific conditions, while Protestants and Orthodox generally do not accept that doctrine. ${sharedScripture()} I can explain the historical background if you'd like.`;
  }

  if (/why does god allow suffering|problem of evil|theodicy/.test(text)) {
    return `${intro} this is a profound question, and Christians answer it humbly. Common themes include human free will, the reality of a fallen world, spiritual formation through suffering, and the hope of final restoration. ${sharedScripture()}`;
  }

  if (/trinity/.test(text)) {
    return `${intro} the Trinity is the Christian confession that the one God exists eternally as Father, Son, and Holy Spirit. ${sharedScripture()} Different traditions may explain the mystery with slightly different emphases, but the core confession is shared.`;
  }

  if (/forgiveness/.test(text)) {
    return `${intro} Scripture repeatedly calls believers to forgive as they have been forgiven. ${sharedScripture()} If you want, I can give a short pastoral explanation or a verse-by-verse study.`;
  }

  if (/shortest verse/.test(text)) {
    return `${intro} John 11:35, "Jesus wept," is commonly recognized as the shortest verse in many English translations. ${sharedScripture()}`;
  }

  return `${intro} Scripture encourages wisdom, humility, and trust in God. ${sharedScripture()} If you want a denomination-specific answer, I can tailor it more closely.`;
}
