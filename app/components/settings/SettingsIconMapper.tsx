import React from 'react';
import { Star, Mail, FileText, Folder, ShieldCheck, HelpCircle, Info, LucideIcon } from 'lucide-react';

/**
 * SettingsIconMapper - Presentation Layer Component
 *
 * Maps domain icon keys to actual Lucide-React icon components.
 * This keeps the Core Domain pure by handling UI-specific mappings
 * in the Presentation layer.
 *
 * Hexagonal Architecture: Presentation Layer (UI Framework Adapters)
 * - Adapts domain string keys to framework-specific components
 * - Decouples domain logic from UI implementation details
 */

interface IconMapping {
  [key: string]: LucideIcon;
}

const iconMap: IconMapping = {
  star: Star,
  mail: Mail,
  fileText: FileText,
  folder: Folder,
  'shield-check': ShieldCheck,
  'document-text': FileText,
  'help-circle': HelpCircle,
  information: Info,
};

interface SettingsIconProps {
  iconKey: string;
  className?: string;
  size?: number;
}

/**
 * SettingsIcon - Component that renders the appropriate icon based on domain key
 *
 * @param iconKey - The string key from the domain (e.g., "star", "mail")
 * @param className - Optional CSS classes for styling
 * @param size - Optional icon size in pixels
 */
export const SettingsIcon: React.FC<SettingsIconProps> = ({
  iconKey,
  className = '',
  size = 16,
}) => {
  const IconComponent = iconMap[iconKey];

  if (!IconComponent) {
    // Gracefully handle unknown keys by rendering nothing
    return null;
  }

  return <IconComponent className={className} size={size} />;
};

export default SettingsIcon;