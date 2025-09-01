import core from '@actions/core';
import github from '@actions/github';

const context = github.context;
const prBody = context.payload.pull_request.body ?? '';
const baseBranch = context.payload.pull_request.label ?? null;
const targetBaseBranchPattern = new RegExp(core.getInput('branch', { required: true }));

if(context.payload.pull_request.merged){
  console.log('Pull request not merged, skipping...');

}else if(targetBaseBranchPattern.test(baseBranch)){
  console.log('Not targeted base branch, skipping...');

}else{
  try{
    // This only covers linking
    const issueRegex = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s#(?<issue>\d+)\b/gmi;

    let match;
    while ((match = issueRegex.exec(prBody)) !== null) {
      const issueNumber = parseInt(match.groups.issue);
      const token = core.getInput('token', { required: true });
      const octokit = github.getOctokit(token);

      await octokit.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        state: 'closed',
        state_reason: 'completed'
      })
    }

  } catch(err) {
    console.error(err);
    core.setFailed(err?.message ?? 'Unknown error occurred');
  }
}