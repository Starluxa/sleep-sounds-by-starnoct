import { ValueObject } from "../../core/value-object";

interface LegalSectionProps {
  heading: string;
  content?: string;
  list?: string[];
  link?: { href: string; text: string };
}

/**
 * Represents a section within a legal document.
 */
export class LegalSection extends ValueObject<LegalSectionProps> {
  private constructor(props: LegalSectionProps) {
    super(props);
  }

  get heading(): string {
    return this.props.heading;
  }

  get content(): string {
    return this.props.content || "";
  }

  get list(): string[] {
    return this.props.list || [];
  }

  get link(): { href: string; text: string } | undefined {
    return this.props.link;
  }

  public static create(props: LegalSectionProps): LegalSection {
    if (!props.heading) {
      throw new Error("Section heading is required");
    }
    return new LegalSection(props);
  }
}
