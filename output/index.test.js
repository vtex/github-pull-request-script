import { run } from './index';
test('lets see', async () => {
    const tasks = [
        () => Promise.resolve(10),
        () => Promise.resolve({ bar: '123' }),
        () => Promise.resolve(undefined),
        () => Promise.resolve('abc'),
    ];
    const result = await run(tasks);
    console.log(result);
});
//# sourceMappingURL=index.test.js.map