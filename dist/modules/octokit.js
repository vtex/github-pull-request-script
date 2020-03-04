import { Octokit } from '@octokit/rest';
import { retry } from '@octokit/plugin-retry';
import { throttling } from '@octokit/plugin-throttling';
const { TOKEN, USER_AGENT } = process.env;
const MyOctokit = Octokit.plugin([retry, throttling]);
export const octokit = new MyOctokit({
    auth: TOKEN,
    userAgent: USER_AGENT,
    throttle: {
        onRateLimit: (retryAfter, options) => {
            octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
            if (options.request.retryCount === 0) {
                // only retries once
                console.log(`Retrying after ${retryAfter} seconds!`);
                return true;
            }
            return false;
        },
        onAbuseLimit: (retryAfter, options) => {
            // does not retry, only logs a warning
            octokit.log.warn(`Abuse detected for request ${options.method} ${options.url}`);
        },
    },
});
export function createPR({ owner, repo, title, head, base }) {
    octokit.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
    });
}
