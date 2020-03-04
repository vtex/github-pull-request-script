var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import 'dotenv/config';
import './config';
import { hasBranch, resetBranch, createBranch, createCommit, } from './modules/git';
function assertParams(params) {
    for (const param of ['repo', 'branchName', 'tasks']) {
        if (!params[param]) {
            throw new Error(`Missing required parameter \`${param}\``);
        }
    }
    if (!Array.isArray(params.tasks)) {
        throw new Error('Tasks should be an array');
    }
    if (params.tasks.some(task => typeof task !== 'function')) {
        throw new Error('Tasks should be a function');
    }
}
export async function run(params) {
    var e_1, _a;
    assertParams(params);
    const { repo, branchName, tasks } = params;
    if (hasBranch(branchName)) {
        resetBranch(branchName);
    }
    else {
        createBranch(branchName);
    }
    try {
        for (var tasks_1 = __asyncValues(tasks), tasks_1_1; tasks_1_1 = await tasks_1.next(), !tasks_1_1.done;) {
            const task = tasks_1_1.value;
            const result = await task();
            if (!result) {
                continue;
            }
            // TODO: change changelog
            createCommit(result.commitMessage);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (tasks_1_1 && !tasks_1_1.done && (_a = tasks_1.return)) await _a.call(tasks_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
