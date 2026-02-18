import { ValueObject } from "../../core/value-object";

interface LegalDocumentIdProps {
  value: string;
}

/**
 * Unique identifier for a Legal Document.
 */
export class LegalDocumentId extends ValueObject<LegalDocumentIdProps> {
  private constructor(props: LegalDocumentIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(id: string): LegalDocumentId {
    if (!id) {
      throw new Error("LegalDocumentId cannot be empty");
    }
    return new LegalDocumentId({ value: id });
  }
}
