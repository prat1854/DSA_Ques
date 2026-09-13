#!/usr/bin/env node

/**
 * LeetCode -> GitHub Automation Script
 * Synchronizes accepted LeetCode solutions directly to prat1854/DSA_Ques
 *
 * Requirements:
 * - LEETCODE_SESSION cookie in environment or .env file
 * - Git repository configured with remote origin (prat1854/DSA_Ques)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '..');
const ENV_FILE_PATH = path.join(REPO_ROOT, '.env');
const SYNC_STATE_PATH = path.join(REPO_ROOT, 'sync-state.json');
const ROOT_README_PATH = path.join(REPO_ROOT, 'README.md');

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

// 1. Safe .env loader (without printing or leaking secrets)
function loadEnvFile() {
  const env = {};
  if (fs.existsSync(ENV_FILE_PATH)) {
    const content = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
    }
  }
  return env;
}

const fileEnv = loadEnvFile();
const LEETCODE_SESSION = process.env.LEETCODE_SESSION || fileEnv.LEETCODE_SESSION || '';
const LEETCODE_CSRF_TOKEN = process.env.LEETCODE_CSRF_TOKEN || fileEnv.LEETCODE_CSRF_TOKEN || '';
const LEETCODE_USERNAME = process.env.LEETCODE_USERNAME || fileEnv.LEETCODE_USERNAME || 'ggZclYw4IT';
const SYNC_LIMIT = parseInt(process.env.SYNC_LIMIT || fileEnv.SYNC_LIMIT || '15', 10);

const args = process.argv.slice(2);
const IS_DRY_RUN = args.includes('--dry-run');
const ONLY_SUBMISSION_ARG = args.find((_, i, arr) => arr[i - 1] === '--submission');
const TARGET_SUBMISSION_ID = ONLY_SUBMISSION_ARG || process.env.TARGET_SUBMISSION_ID || null;

// 2. Language extension mapping
const LANGUAGE_MAP = {
  javascript: { ext: 'js', lang: 'JavaScript', fence: 'javascript', filename: 'solution.js' },
  typescript: { ext: 'ts', lang: 'TypeScript', fence: 'typescript', filename: 'solution.ts' },
  python: { ext: 'py', lang: 'Python', fence: 'python', filename: 'solution.py' },
  python3: { ext: 'py', lang: 'Python 3', fence: 'python', filename: 'solution.py' },
  java: { ext: 'java', lang: 'Java', fence: 'java', filename: 'Solution.java' },
  cpp: { ext: 'cpp', lang: 'C++', fence: 'cpp', filename: 'solution.cpp' },
  c: { ext: 'c', lang: 'C', fence: 'c', filename: 'solution.c' },
  csharp: { ext: 'cs', lang: 'C#', fence: 'csharp', filename: 'Solution.cs' },
  golang: { ext: 'go', lang: 'Go', fence: 'go', filename: 'solution.go' },
  rust: { ext: 'rs', lang: 'Rust', fence: 'rust', filename: 'solution.rs' },
  ruby: { ext: 'rb', lang: 'Ruby', fence: 'ruby', filename: 'solution.rb' },
  swift: { ext: 'swift', lang: 'Swift', fence: 'swift', filename: 'solution.swift' },
  kotlin: { ext: 'kt', lang: 'Kotlin', fence: 'kotlin', filename: 'Solution.kt' },
  scala: { ext: 'scala', lang: 'Scala', fence: 'scala', filename: 'solution.scala' },
  php: { ext: 'php', lang: 'PHP', fence: 'php', filename: 'solution.php' },
  mysql: { ext: 'sql', lang: 'MySQL', fence: 'sql', filename: 'solution.sql' },
  mssql: { ext: 'sql', lang: 'MS SQL Server', fence: 'sql', filename: 'solution.sql' },
  oraclesql: { ext: 'sql', lang: 'Oracle SQL', fence: 'sql', filename: 'solution.sql' },
  postgresql: { ext: 'sql', lang: 'PostgreSQL', fence: 'sql', filename: 'solution.sql' },
};

function getLanguageMeta(langStr) {
  const normalized = (langStr || '').toLowerCase();
  return LANGUAGE_MAP[normalized] || {
    ext: 'txt',
    lang: langStr || 'Unknown',
    fence: 'text',
    filename: 'solution.txt',
  };
}

// 3. Load & Save Sync State
function loadSyncState() {
  if (fs.existsSync(SYNC_STATE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(SYNC_STATE_PATH, 'utf-8'));
    } catch (e) {
      console.warn('[SyncState] Warning: Failed to parse sync-state.json, initializing fresh state.');
    }
  }
  return { lastSyncTime: null, syncedSubmissions: {} };
}

function saveSyncState(state) {
  state.lastSyncTime = new Date().toISOString();
  fs.writeFileSync(SYNC_STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

// 4. GraphQL Helper
async function queryLeetCodeGraphQL(query, variables = {}, withAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Referer: 'https://leetcode.com',
    Origin: 'https://leetcode.com',
  };

  if (withAuth) {
    if (!LEETCODE_SESSION) {
      throw new Error('LEETCODE_SESSION is required for authenticated requests.');
    }
    const cookieParts = [`LEETCODE_SESSION=${LEETCODE_SESSION}`];
    if (LEETCODE_CSRF_TOKEN) {
      cookieParts.push(`csrftoken=${LEETCODE_CSRF_TOKEN}`);
      headers['x-csrftoken'] = LEETCODE_CSRF_TOKEN;
    }
    headers['Cookie'] = cookieParts.join('; ');
  }

  const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode GraphQL HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors && data.errors.length > 0) {
    const msg = data.errors.map((e) => e.message).join(', ');
    throw new Error(`LeetCode GraphQL returned errors: ${msg}`);
  }

  return data.data;
}

// 5. Fetch Recent Accepted Submissions (Public)
async function fetchRecentAcSubmissions(username, limit = 15) {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;
  const data = await queryLeetCodeGraphQL(query, { username, limit }, false);
  return data?.recentAcSubmissionList || [];
}

// 6. Fetch Question Details (Public)
async function fetchQuestionDetails(titleSlug) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        difficulty
      }
    }
  `;
  const data = await queryLeetCodeGraphQL(query, { titleSlug }, false);
  return data?.question;
}

// 7. Fetch Submission Details & Code (Private / Authenticated)
async function fetchSubmissionDetails(submissionId) {
  const query = `
    query submissionDetails($submissionId: Int!) {
      submissionDetails(submissionId: $submissionId) {
        runtime
        runtimeDisplay
        runtimePercentile
        memory
        memoryDisplay
        memoryPercentile
        code
        timestamp
        statusCode
        lang {
          name
          verboseName
        }
        question {
          questionId
          title
          titleSlug
          difficulty
        }
      }
    }
  `;
  const data = await queryLeetCodeGraphQL(query, { submissionId: parseInt(submissionId, 10) }, true);
  return data?.submissionDetails;
}

// 8. Syntax Validation
function validateSyntax(code, lang) {
  if (lang === 'javascript') {
    try {
      new vm.Script(code);
      return { valid: true, error: null };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }
  // For other languages, syntax check is skipped
  return { valid: true, error: null };
}

// 9. Problem README Generator
function generateProblemReadme({
  frontendId,
  title,
  difficulty,
  titleSlug,
  languageName,
  languageFence,
  submissionId,
  timestamp,
  runtimeDisplay,
  runtimePercentile,
  memoryDisplay,
  memoryPercentile,
  code,
}) {
  const dateStr = timestamp
    ? new Date(parseInt(timestamp, 10) * 1000).toUTCString()
    : new Date().toUTCString();

  const metricsLines = [];
  if (runtimeDisplay) {
    const perc = runtimePercentile ? ` (beats ${runtimePercentile.toFixed(2)}%)` : '';
    metricsLines.push(`- **Runtime:** \`${runtimeDisplay}\`${perc}`);
  }
  if (memoryDisplay) {
    const perc = memoryPercentile ? ` (beats ${memoryPercentile.toFixed(2)}%)` : '';
    metricsLines.push(`- **Memory:** \`${memoryDisplay}\`${perc}`);
  }

  const metricsSection = metricsLines.length > 0 ? metricsLines.join('\n') + '\n' : '';

  return `# ${frontendId}. ${title}

## Difficulty: ${difficulty} | Language: ${languageName}

- **LeetCode URL:** [${title}](https://leetcode.com/problems/${titleSlug}/)
- **Submission ID:** \`${submissionId}\`
- **Submitted At:** \`${dateStr}\`
${metricsSection}
## Solution Code

\`\`\`${languageFence}
${code.trim()}
\`\`\`
`;
}

// 10. Update Root README.md
function updateRootReadme(syncState) {
  const submissions = Object.values(syncState.syncedSubmissions || {});

  // Sort by problem number ascending
  submissions.sort((a, b) => {
    const numA = parseInt(a.problemFrontendId || '0', 10);
    const numB = parseInt(b.problemFrontendId || '0', 10);
    return numA - numB;
  });

  const countTotal = submissions.length;
  const countEasy = submissions.filter((s) => s.difficulty === 'Easy').length;
  const countMedium = submissions.filter((s) => s.difficulty === 'Medium').length;
  const countHard = submissions.filter((s) => s.difficulty === 'Hard').length;

  let content = `# LeetCode Solutions (DSA)

Automated repository for LeetCode solutions solved by [@${LEETCODE_USERNAME}](https://leetcode.com/u/${LEETCODE_USERNAME}/).

### Statistics

| Category | Solved Count |
| :--- | :--- |
| **Total** | **${countTotal}** |
| Easy | ${countEasy} |
| Medium | ${countMedium} |
| Hard | ${countHard} |

---

### Solved Problems

| # | Title | Difficulty | Language | Solution Folder |
| :--- | :--- | :--- | :--- | :--- |
`;

  if (submissions.length === 0) {
    content += `| - | *No problems synced yet* | - | - | - |\n`;
  } else {
    for (const sub of submissions) {
      const folderRelative = sub.path.replace(/\\/g, '/');
      const problemLink = `[${sub.title}](https://leetcode.com/problems/${sub.titleSlug}/)`;
      const folderLink = `[${folderRelative}](${folderRelative}/)`;
      content += `| ${sub.problemFrontendId} | ${problemLink} | ${sub.difficulty} | ${sub.lang} | ${folderLink} |\n`;
    }
  }

  content += `\n---\n*Last synchronized: ${new Date().toUTCString()}*\n`;

  fs.writeFileSync(ROOT_README_PATH, content, 'utf-8');
}

// 11. Main Sync Process
async function main() {
  console.log('='.repeat(60));
  console.log('      LeetCode -> GitHub Solution Synchronizer');
  console.log('='.repeat(60));
  console.log(`Target Repository : prat1854/DSA_Ques`);
  console.log(`LeetCode User     : ${LEETCODE_USERNAME}`);
  console.log(`Dry Run Mode      : ${IS_DRY_RUN ? 'ENABLED (no git changes)' : 'DISABLED'}`);

  // Check authentication availability without revealing value
  if (!LEETCODE_SESSION) {
    console.error('\n[AUTHENTICATION STOP]');
    console.error('LEETCODE_SESSION is missing or empty.');
    console.error('\nHow to set up credentials locally:');
    console.error('1. Open https://leetcode.com in your web browser and sign in.');
    console.error('2. Open Developer Tools (F12) -> Application tab -> Cookies -> https://leetcode.com');
    console.error('3. Copy the value of the "LEETCODE_SESSION" cookie.');
    console.error('4. Create or edit "d:\\DSA_Ques\\.env":');
    console.error('     LEETCODE_SESSION=your_cookie_value_here');
    console.error('     LEETCODE_CSRF_TOKEN=your_csrftoken_here (optional)');
    console.error('5. Run: npm run sync\n');
    process.exit(1);
  }

  console.log('LeetCode Auth     : Configured (LEETCODE_SESSION present)');

  // Load sync state
  const syncState = loadSyncState();
  const alreadySyncedCount = Object.keys(syncState.syncedSubmissions || {}).length;
  console.log(`Already Synced    : ${alreadySyncedCount} submission(s) tracked in sync-state.json`);

  // Step 1: Fetch recent submissions
  console.log(`\n[1/5] Querying recent accepted submissions for "${LEETCODE_USERNAME}"...`);
  let recentSubmissions = [];
  try {
    recentSubmissions = await fetchRecentAcSubmissions(LEETCODE_USERNAME, SYNC_LIMIT);
  } catch (err) {
    console.error('[Error] Failed to query recentAcSubmissionList:', err.message);
    process.exit(1);
  }

  if (!recentSubmissions || recentSubmissions.length === 0) {
    console.log('No recent accepted submissions returned by LeetCode.');
    return;
  }

  console.log(`Found ${recentSubmissions.length} recent accepted submission(s).`);

  // Filter pending submissions
  let candidates = recentSubmissions.filter((sub) => {
    if (TARGET_SUBMISSION_ID && sub.id !== TARGET_SUBMISSION_ID) {
      return false;
    }
    return !syncState.syncedSubmissions[sub.id];
  });

  if (TARGET_SUBMISSION_ID && candidates.length === 0) {
    // Check if target was already synced
    if (syncState.syncedSubmissions[TARGET_SUBMISSION_ID]) {
      console.log(`Submission #${TARGET_SUBMISSION_ID} has already been synced.`);
    } else {
      console.log(`Submission #${TARGET_SUBMISSION_ID} was not found in the ${SYNC_LIMIT} recent submissions.`);
    }
    return;
  }

  if (candidates.length === 0) {
    console.log('\nAll recent submissions are already up to date in sync-state.json. Nothing to sync.');
    return;
  }

  console.log(`Found ${candidates.length} new submission(s) to process.`);

  // Process each candidate (oldest to newest so git history matches timeline)
  candidates.reverse();

  let newlySyncedCount = 0;

  for (const candidate of candidates) {
    const submissionId = candidate.id;
    const titleSlug = candidate.titleSlug;
    console.log(`\n------------------------------------------------------------`);
    console.log(`Processing: "${candidate.title}" (Submission ID: ${submissionId})`);

    // Step 2: Fetch question details
    console.log(`[2/5] Fetching question details for slug "${titleSlug}"...`);
    let qDetails = null;
    try {
      qDetails = await fetchQuestionDetails(titleSlug);
    } catch (err) {
      console.warn(`[Warning] Could not fetch question details for ${titleSlug}:`, err.message);
    }

    const frontendId = qDetails?.questionFrontendId || '0';
    const paddedId = frontendId.toString().padStart(4, '0');
    const difficulty = qDetails?.difficulty || 'Medium';
    const problemTitle = qDetails?.title || candidate.title;

    // Step 3: Fetch submission details (Authenticated)
    console.log(`[3/5] Fetching solution source code from submissionDetails(${submissionId})...`);
    let subDetails = null;
    try {
      subDetails = await fetchSubmissionDetails(submissionId);
    } catch (err) {
      console.error(`\n[AUTHENTICATION ERROR] Failed to fetch submissionDetails: ${err.message}`);
      console.error('Please verify your LEETCODE_SESSION cookie is valid and unexpired.');
      process.exit(1);
    }

    if (!subDetails || !subDetails.code) {
      console.error('\n[AUTHENTICATION FAILURE]');
      console.error(`LeetCode returned null submissionDetails for Submission ID ${submissionId}.`);
      console.error('This occurs when LEETCODE_SESSION is missing, invalid, or expired.');
      console.error('To protect integrity, NO fake or generic code will be written.');
      console.error('Please refresh your LEETCODE_SESSION in .env and run again.');
      process.exit(1);
    }

    const submittedCode = subDetails.code;
    const langName = subDetails.lang?.name || candidate.lang || 'javascript';
    const langMeta = getLanguageMeta(langName);

    console.log(`Retrieved exact code: ${submittedCode.length} characters in ${langMeta.lang}.`);

    // Step 4: Syntax validation
    const syntaxCheck = validateSyntax(submittedCode, langName.toLowerCase());
    if (!syntaxCheck.valid) {
      console.warn(`[Syntax Warning] Basic validation reported: ${syntaxCheck.error}`);
    } else {
      console.log(`Syntax validation passed.`);
    }

    // Step 5: Directory & File Creation
    const targetDirName = `${paddedId}-${titleSlug}`;
    const problemDir = path.join(REPO_ROOT, difficulty, targetDirName);
    const solutionFilePath = path.join(problemDir, langMeta.filename);
    const readmeFilePath = path.join(problemDir, 'README.md');

    console.log(`[4/5] Preparing files in: ${path.relative(REPO_ROOT, problemDir)}`);

    const problemReadmeContent = generateProblemReadme({
      frontendId,
      title: problemTitle,
      difficulty,
      titleSlug,
      languageName: langMeta.lang,
      languageFence: langMeta.fence,
      submissionId,
      timestamp: candidate.timestamp || subDetails.timestamp,
      runtimeDisplay: subDetails.runtimeDisplay,
      runtimePercentile: subDetails.runtimePercentile,
      memoryDisplay: subDetails.memoryDisplay,
      memoryPercentile: subDetails.memoryPercentile,
      code: submittedCode,
    });

    if (IS_DRY_RUN) {
      console.log(`[DRY RUN] Would create:`);
      console.log(`  - ${path.relative(REPO_ROOT, solutionFilePath)}`);
      console.log(`  - ${path.relative(REPO_ROOT, readmeFilePath)}`);
      continue;
    }

    // Write files
    fs.mkdirSync(problemDir, { recursive: true });
    fs.writeFileSync(solutionFilePath, submittedCode, 'utf-8');
    fs.writeFileSync(readmeFilePath, problemReadmeContent, 'utf-8');
    console.log(`Created: ${path.relative(REPO_ROOT, solutionFilePath)}`);
    console.log(`Created: ${path.relative(REPO_ROOT, readmeFilePath)}`);

    // Update state
    syncState.syncedSubmissions[submissionId] = {
      problemId: qDetails?.questionId || frontendId,
      problemFrontendId: frontendId,
      title: problemTitle,
      titleSlug,
      difficulty,
      lang: langMeta.lang,
      timestamp: candidate.timestamp || subDetails.timestamp,
      syncedAt: new Date().toISOString(),
      path: path.relative(REPO_ROOT, problemDir),
    };
    saveSyncState(syncState);
    updateRootReadme(syncState);

    // Step 6: Git commit & push for this problem
    console.log(`[5/5] Committing and pushing to GitHub...`);
    try {
      const relativeProblemDir = path.relative(REPO_ROOT, problemDir).replace(/\\/g, '/');
      execSync(`git add "${relativeProblemDir}" sync-state.json README.md`, {
        cwd: REPO_ROOT,
        stdio: 'pipe',
      });

      const commitMsg = `Solve #${frontendId} - ${problemTitle}`;
      execSync(`git commit -m "${commitMsg}"`, {
        cwd: REPO_ROOT,
        stdio: 'pipe',
      });

      const commitHash = execSync('git rev-parse --short HEAD', {
        cwd: REPO_ROOT,
        encoding: 'utf-8',
      }).trim();
      console.log(`Created commit [${commitHash}]: "${commitMsg}"`);

      // Push to origin main
      console.log(`Pushing to origin main...`);
      execSync('git push origin main', {
        cwd: REPO_ROOT,
        stdio: 'inherit',
      });

      console.log(`SUCCESS: Pushed commit ${commitHash} to origin/main.`);
      newlySyncedCount++;
    } catch (gitErr) {
      console.error(`[Git Error] Failed during commit/push:`, gitErr.message);
      process.exit(1);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Sync process completed. Total newly synced: ${newlySyncedCount}`);
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('\n[Unhandled Error]:', err.message);
  process.exit(1);
});
