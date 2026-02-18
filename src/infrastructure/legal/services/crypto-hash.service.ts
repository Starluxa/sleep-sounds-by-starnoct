import { IHashService } from "../../../domain/legal/services/hash.service";
import * as crypto from "crypto";

/**
 * Implementation of IHashService using Node.js crypto module.
 * Provides SHA-256 hashing for legal document integrity.
 */
export class CryptoHashService implements IHashService {
  public hash(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  public getAlgorithm(): string {
    return "SHA-256";
  }
}
