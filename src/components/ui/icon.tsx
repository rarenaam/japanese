import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

/**
 * Dynamic Icon Component - Runtime Fallback for Missing Icon Imports
 * 
 * This component provides a safety net when icons are used without being imported.
 * While proper imports are always preferred, this prevents runtime crashes.
 * 
 * @example
 * // Instead of importing individually (preferred way):
 * import { Heart } from "lucide-react";
 * 
 * // You can use this component if needed:
 * <Icon name="Heart" className="h-5 w-5" />
 * 
 * @warning This component bundles ALL Lucide icons, which may impact bundle size.
 * It should only be used as a fallback mechanism, not as the primary icon API.
 */
export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
  fallback?: keyof typeof LucideIcons;
}

export const Icon = ({ name, fallback = 'HelpCircle', ...props }: IconProps) => {
  // Try to find the icon component
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<LucideProps>;
  
  // If icon is not found, use fallback
  if (!IconComponent || typeof IconComponent !== 'function') {
    console.warn(
      `[Icon Component] Icon "${name}" not found in lucide-react. Using fallback "${fallback}".`,
      '\nPlease import icons directly for better tree-shaking:',
      `\nimport { ${name} } from "lucide-react";`
    );
    
    const FallbackIcon = LucideIcons[fallback] as React.ComponentType<LucideProps>;
    return <FallbackIcon {...props} />;
  }
  
  return <IconComponent {...props} />;
};

/**
 * Hook to safely get an icon component by name
 * 
 * @example
 * const HeartIcon = useIcon('Heart');
 * return <HeartIcon className="h-5 w-5" />;
 */
export const useIcon = (name: string, fallback: keyof typeof LucideIcons = 'HelpCircle') => {
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<LucideProps>;
  
  if (!IconComponent || typeof IconComponent !== 'function') {
    console.warn(`[useIcon] Icon "${name}" not found. Using fallback "${fallback}".`);
    return LucideIcons[fallback] as React.ComponentType<LucideProps>;
  }
  
  return IconComponent;
};

/**
 * Utility to check if an icon exists
 */
export const hasIcon = (name: string): boolean => {
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons];
  return IconComponent !== undefined && typeof IconComponent === 'function';
};

/**
 * Get all available icon names
 */
export const getAvailableIcons = (): string[] => {
  return Object.keys(LucideIcons).filter(
    key => typeof LucideIcons[key as keyof typeof LucideIcons] === 'function'
  );
};
