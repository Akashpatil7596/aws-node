import bcrypt from "bcrypt";

class CommonFunctions {
    static async matchString(string, matchString) {
        return string === matchString;
    }

    static async decryptedPassword(myPlaintextPassword, hash) {
        return await bcrypt.compare(myPlaintextPassword, hash);
    }
}

export default CommonFunctions;
