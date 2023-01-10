module.exports = {
    debug(...args) {
        console.log("[DEBUG]", ...args);
    },
    die(...args) {
        console.log("[DIE]", ...args);
        process.exit(0);
    }
};