import { ImageSourcePropType } from 'react-native';

export const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';

// Curated high-resolution fallback image map for local asset paths
export const LOCAL_ASSET_FALLBACK_MAP: Record<string, string> = {
  'assets/images/fruits/apple.png':
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/banana.png':
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/mango.png':
    'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/orange.png':
    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/green-grapes.png':
    'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/black-grapes.png':
    'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/watermelon.png':
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/papaya.png':
    'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/pineapple.png':
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/pomegranate.png':
    'https://images.unsplash.com/photo-1541344999736-83eca872f242?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/guava.png':
    'https://images.unsplash.com/photo-1536511135899-7006871a3780?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/strawberry.png':
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/kiwi.png':
    'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/sweet-lime.png':
    'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/coconut.png':
    'https://images.unsplash.com/photo-1544378730-8b5104b18790?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/muskmelon.png':
    'https://images.unsplash.com/photo-1571575179703-4bde4ee95304?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/sapota.png':
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/custard-apple.png':
    'https://images.unsplash.com/photo-1589533610925-1cffc309ebaa?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/dragon-fruit.png':
    'https://images.unsplash.com/photo-1527325678964-54921661f888?w=600&auto=format&fit=crop&q=80',
  'assets/images/fruits/pear.png':
    'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=600&auto=format&fit=crop&q=80',
};

/**
 * Resolves any product image string to a safe ImageSourcePropType.
 * Prevents passing local asset paths like 'assets/images/fruits/apple.png'
 * as remote URI objects ({ uri: 'assets/...' }), which causes React Native render errors.
 */
export const resolveProductImageSource = (imagePathOrUri?: string | null): ImageSourcePropType => {
  if (!imagePathOrUri || typeof imagePathOrUri !== 'string' || imagePathOrUri.trim() === '') {
    return { uri: DEFAULT_FALLBACK_IMAGE };
  }

  const trimmed = imagePathOrUri.trim();

  // If it's already a full remote HTTP or HTTPS URL, load via URI
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { uri: trimmed };
  }

  // Check if there is a mapped remote fallback for this local asset path
  if (LOCAL_ASSET_FALLBACK_MAP[trimmed]) {
    return { uri: LOCAL_ASSET_FALLBACK_MAP[trimmed] };
  }

  // Fallback for any other local asset string (e.g. assets/...)
  const normalizedKey = Object.keys(LOCAL_ASSET_FALLBACK_MAP).find(k =>
    trimmed.toLowerCase().includes(k.split('/').pop()?.replace('.png', '') || '___')
  );
  if (normalizedKey) {
    return { uri: LOCAL_ASSET_FALLBACK_MAP[normalizedKey] };
  }

  return { uri: DEFAULT_FALLBACK_IMAGE };
};
