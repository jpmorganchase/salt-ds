Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.managerEntries = managerEntries;

function managerEntries(entry = []) {
  return [...entry, require.resolve("./register")]; //👈 addon implementation
}

export {};
