// Site Section Backgrounds & Visual Customization Config
// Inspired by the 9 reference images (GCORE, Steary, Gnatfes, Rome VisionOS, Inkspire, IT Empire, Aeroluxe, Velopay, Orizon)

export interface SectionCustomization {
  homeBg: string;
  homeBgType: 'image' | 'gradient' | 'gif';
  founderPortraitUrl: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
  playgroundBg: string;
  studioBg: string;
  aboutBg: string;
  footerBg: string;
  servicesBg: string;
  workBg: string;
  edgeGlowIntensity: 'subtle' | 'medium' | 'intense';
  accentTheme: 'cyan-aurora' | 'emerald-glow' | 'amber-gold' | 'crimson-edge';
}

export const DEFAULT_CUSTOMIZATION: SectionCustomization = {
  // Image 1 (GCORE) & Image 8 (Velopay): deep space with subtle glowing network arcs & dark amber/cyan rim
  homeBg: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2400&q=85',
  homeBgType: 'image',
  
  // Center Home Portrait: Glassy dark ancient blue container
  founderPortraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
  founderName: 'Jehu Nanpan',
  founderRole: 'Founder & Principal Systems Architect',
  founderBio: 'Bridging high-dimensional AI inference, distributed systems, and sacred digital experiences.',

  // Image 9 (Orizon Design) & Image 4 (Rome VisionOS): 4K crisp frosted glass architectural space
  playgroundBg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2400&q=85',

  // Image 2 (Steary) & Image 6 (IT EMPIRE): deep sci-fi architectural curves & ambient light
  studioBg: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=2400&q=85',

  // Image 7 (Aeroluxe) & Image 5 (Inkspire): luxury studio lighting & rich digital artwork atmosphere
  aboutBg: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2400&q=85',

  // Image 5 (Inkspire) aesthetic for footer
  footerBg: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2400&q=85',

  // Image 3 (Gnatfes) electric holographic aesthetic
  servicesBg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=2400&q=85',

  workBg: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=2400&q=85',

  edgeGlowIntensity: 'subtle',
  accentTheme: 'cyan-aurora',
};

export const getCustomization = (): SectionCustomization => {
  if (typeof window === 'undefined') return DEFAULT_CUSTOMIZATION;
  try {
    const raw = localStorage.getItem('jadai_section_customization');
    if (raw) {
      return { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load customization from storage', e);
  }
  return DEFAULT_CUSTOMIZATION;
};

export const saveCustomization = (custom: Partial<SectionCustomization>): SectionCustomization => {
  if (typeof window === 'undefined') return DEFAULT_CUSTOMIZATION;
  try {
    const updated = { ...getCustomization(), ...custom };
    localStorage.setItem('jadai_section_customization', JSON.stringify(updated));
    window.dispatchEvent(new Event('jadai_customization_changed'));
    return updated;
  } catch (e) {
    console.error('Failed to save customization', e);
    return DEFAULT_CUSTOMIZATION;
  }
};
