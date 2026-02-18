import { ValueObject } from "../../core/value-object";

interface ContentHashProps {
  value: string;
  algorithm: string;
}

/**
 * ContentHash Value Object
 * Ensures tamper-evidence for legal documents.
 * 
 * COMPLIANCE MAPPING (EU AI Act 2026):
 * - Article 15: Requires high-risk AI systems to be resilient against unauthorized changes.
 * - Article 73: Forensic evidence preservation via cryptographic verification.
 */
export class ContentHash extends ValueObject<ContentHashProps> {
  private constructor(props: ContentHashProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  get algorithm(): string {
    return this.props.algorithm;
  }

  /**
   * Creates a ContentHash from a pre-calculated hash string.
   * @param hash The hash string (e.g. SHA-256 hex)
   * @param algorithm The algorithm used (default: 'SHA-256')
   */
  public static create(hash: string, algorithm: string = "SHA-256"): ContentHash {
    if (!hash || hash.length < 32) {
      throw new Error("Invalid hash format");
    }
    return new ContentHash({ value: hash, algorithm });
  }
}
