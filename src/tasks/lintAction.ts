// {
//   "name": "Lint",
//   "on": [
//     "push",
//     "pull_request"
//   ],
//   "jobs": {
//     "run-linters": {
//       "name": "Run linters",
//       "runs-on": "ubuntu-latest",
//       "steps": [
//         {
//           "name": "Check out Git repository",
//           "uses": "actions/checkout@v2"
//         },
//         {
//           "name": "Set up Node.js",
//           "uses": "actions/setup-node@v1",
//           "with": {
//             "node-version": 12
//           }
//         },
//         {
//           "name": "Install dependencies",
//           "run": "yarn"
//         },
//         {
//           "name": "Run lint task",
//           "run": "yarn lint"
//         }
//       ]
//     }
//   }
// }
