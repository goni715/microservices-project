import bcrypt from "bcryptjs";
import envConfig from "../config/env";

class PasswordHelper {
  async checkPassword(plainTextPass: string, hashPassword: string) {
    return await bcrypt.compare(plainTextPass, hashPassword);
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(Number(envConfig.bcrypt_salt_rounds));
    return await bcrypt.hash(password, salt); //hashedPassword
  }
}

export const { checkPassword, hashPassword } = new PasswordHelper();
