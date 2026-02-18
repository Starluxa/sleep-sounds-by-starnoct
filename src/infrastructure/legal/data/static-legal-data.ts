export interface LegalSection {
  heading: string;
  content?: string;
  list?: string[];
  link?: { href: string; text: string };
}

export interface LegalContent {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const PRIVACY_POLICY: LegalContent = {
  title: "Privacy Policy",
  lastUpdated: "November 2024",
  sections: [
    {
      heading: "1. Information We Collect",
      content: "We collect information you provide directly to us, including:",
      list: [
        "Account Information: When you create an account, we collect your email address and password.",
        "Usage Data: We collect information about how you interact with our app, such as the sounds you play and mixes you create.",
        "Saved Mixes: We store your created sound combinations to provide the save/load functionality."
      ]
    },
    {
      heading: "2. How We Use Your Information",
      content: "We use the information we collect to:",
      list: [
        "Provide, maintain, and improve our services",
        "Personalize your listening experience",
        "Save and restore your sound mixes",
        "Communicate with you about your account",
        "Analyze usage patterns to improve our app"
      ]
    },
    {
      heading: "3. Data Sharing and Disclosure",
      content: "We do not share your personal information with third parties except in the following limited circumstances:",
      list: [
        "With Your Consent: We may share information when you explicitly request it",
        "Service Providers: We use Supabase for authentication and data storage",
        "Legal Requirements: We may disclose information if required by law"
      ]
    },
    {
      heading: "4. Data Security",
      content: "We implement reasonable security measures to protect your personal information. However, no internet transmission is ever 100% secure."
    },
    {
      heading: "5. Your Rights",
      content: "You have the right to:",
      list: [
        "Access and receive a copy of your personal data",
        "Request correction of inaccurate data",
        "Request deletion of your account and data",
        "Export your data in a portable format"
      ]
    },
    {
      heading: "6. Data Retention",
      content: "We retain your information as long as your account is active. You can delete your account and data at any time using the \"Delete Account\" feature in Settings."
    },
    {
      heading: "7. Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy in the app."
    },
    {
      heading: "8. Contact Us",
      link: { href: "mailto:starnoctapps@proton.me", text: "starnoctapps@proton.me" },
      content: "If you have questions about this Privacy Policy, please contact us at:"
    }
  ]
};

export const TERMS_OF_SERVICE: LegalContent = {
  title: "Terms of Service",
  lastUpdated: "November 2024",
  sections: [
    {
      heading: "1. Acceptance of Terms",
      content: "By accessing or using the Sleep Sounds by StarNoct mobile application (the \"Service\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service."
    },
    {
      heading: "2. Description of Service",
      content: "Sleep Sounds by StarNoct provides ambient sound mixing for sleep and relaxation. The Service includes:",
      list: [
        "Access to a library of sleep sounds",
        "Ability to mix multiple sounds simultaneously",
        "Save and load custom sound mixes",
        "Sleep timer functionality"
      ]
    },
    {
      heading: "3. User Accounts",
      content: "To access certain features of the Service, you must create an account. You agree to:",
      list: [
        "Provide accurate and complete information",
        "Maintain the security of your account credentials",
        "Accept responsibility for all activities under your account",
        "Notify us immediately of any unauthorized use"
      ]
    },
    {
      heading: "4. User-Generated Content",
      content: "The Service allows you to create and save sound mixes. You retain all rights to your saved mixes. By using the Service, you grant us permission to store and retrieve your mixes for your personal use."
    },
    {
      heading: "5. Acceptable Use",
      content: "You agree not to:",
      list: [
        "Use the Service for any illegal purpose",
        "Attempt to gain unauthorized access to our systems",
        "Interfere with the proper working of the Service",
        "Reproduce, duplicate, copy, sell, or exploit any portion of the Service without express permission"
      ]
    },
    {
      heading: "6. Intellectual Property",
      content: "The Service and its original content, features, and functionality are owned by Sleep Sounds by StarNoct and are protected by international copyright, trademark, and other intellectual property laws."
    },
    {
      heading: "7. Termination",
      content: "We may terminate or suspend your account immediately, without prior notice, for conduct that violates these Terms. Upon termination, your right to use the Service will immediately cease. You can also delete your account at any time through the Settings page."
    },
    {
      heading: "8. Disclaimer of Warranties",
      content: "The Service is provided on an \"AS IS\" and \"AS AVAILABLE\" basis. We make no warranties, expressed or implied, regarding the Service's reliability, availability, or suitability for your needs."
    },
    {
      heading: "9. Limitation of Liability",
      content: "In no event shall Sleep Sounds by StarNoct be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service."
    },
    {
      heading: "10. Changes to Terms",
      content: "We reserve the right to modify these Terms at any time. We will notify users of material changes through the app. Your continued use after changes constitutes acceptance of the new Terms."
    },
    {
      heading: "11. Governing Law",
      content: "These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions."
    },
    {
      heading: "12. Contact Information",
      link: { href: "mailto:starnoctapps@proton.me", text: "starnoctapps@proton.me" },
      content: "If you have any questions about these Terms, please contact us at:"
    }
  ]
};
