# Performance Optimization Guide

## Implemented Optimizations

### Code Splitting
- **Vendor Chunks**: React, UI components, and Supabase separated into distinct chunks
- **Lazy Loading**: Routes and components loaded on-demand
- **Tree Shaking**: Unused code automatically removed during build

### Image Optimization
- **Lazy Loading**: All product images use `loading="lazy"` attribute
- **Async Decoding**: Images decoded asynchronously with `decoding="async"`
- **Error Handling**: Fallback images for broken URLs
- **Aspect Ratio**: Proper aspect ratios prevent layout shifts
- **Background Colors**: Muted backgrounds during image load

### React Performance
- **useMemo**: Expensive computations cached (filtering, sorting)
- **useCallback**: Event handlers memoized where appropriate
- **Proper Dependencies**: All hooks have correct dependency arrays
- **Key Props**: Stable keys used in lists

### Network Optimization
- **Real-time Subscriptions**: Efficient Supabase subscriptions with proper cleanup
- **Selective Queries**: Only fetch required fields from database
- **Connection Pooling**: Supabase handles connection pooling automatically

### Bundle Optimization
- **Chunk Size Limit**: Warning at 1000KB
- **Optimized Dependencies**: lucide-react excluded from pre-bundling
- **Production Builds**: Minification and compression enabled

## Performance Metrics

### Target Metrics
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Bundle Size Targets
- **Main Bundle**: < 200KB (gzipped)
- **Vendor Chunks**: < 150KB each (gzipped)
- **Total Initial Load**: < 500KB (gzipped)

## Monitoring Performance

### Development
```bash
npm run build
npm run preview
```

Use Chrome DevTools:
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Run performance audit
4. Review recommendations

### Production Monitoring
- Set up Real User Monitoring (RUM)
- Track Core Web Vitals
- Monitor bundle sizes
- Track API response times

## Further Optimizations

### Image CDN (Recommended)
```typescript
// Use image CDN for automatic optimization
const optimizedImageUrl = (url: string, width: number) => {
  return `https://your-cdn.com/image?url=${encodeURIComponent(url)}&w=${width}&q=80`;
};
```

### Service Worker (PWA)
```typescript
// Add service worker for offline support
// Install workbox-vite-plugin
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});
```

### Database Indexing
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
```

### Caching Strategy
```typescript
// Add React Query for advanced caching
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

## Performance Checklist

- [x] Code splitting implemented
- [x] Images lazy loaded
- [x] Memoization used appropriately
- [x] Bundle size optimized
- [x] Real-time subscriptions optimized
- [x] Error boundaries implemented
- [ ] Service worker for offline support
- [ ] Image CDN integration
- [ ] Database indexes optimized
- [ ] Advanced caching with React Query
- [ ] Performance monitoring setup

## Build Analysis

Analyze bundle size:
```bash
npm run build
```

Check the `dist` folder for:
- Chunk sizes
- Asset sizes
- Compression ratios

## Browser Support

Optimized for:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Performance

- Touch-optimized interactions
- Responsive images
- Reduced animations on low-end devices
- Efficient scroll handling

## Recommendations

1. **Use CDN**: Serve static assets from CDN
2. **Enable Compression**: Gzip/Brotli on server
3. **HTTP/2**: Use HTTP/2 for multiplexing
4. **Preload Critical Assets**: Add preload hints
5. **Defer Non-Critical JS**: Load analytics last
6. **Optimize Fonts**: Use font-display: swap
7. **Reduce Third-Party Scripts**: Minimize external dependencies
