# @tchomb/upload

Upload state machine and transport adapters for [Tchomb](https://tchomb.com) video uploads.

## Installation

```bash
npm install @tchomb/upload
```

## Usage

### Transport (low-level)

```typescript
import { createUploader } from '@tchomb/upload';

const uploader = createUploader({
  baseUrl: 'https://api.tchomb.com',
  getAuthHeaders: async () => ({
    Authorization: `Bearer ${token}`,
  }),
});

const result = await uploader.upload(fileUri, {
  caption: 'Ma nouvelle vidéo',
  hashtags: ['cameroun', 'musique'],
  language: 'fr',
  onProgress: (pct) => console.log(`${pct}%`),
});
```

### React Hook

```tsx
import { useUpload } from '@tchomb/upload';

function UploadScreen() {
  const { state, progress, error, videoId, start } = useUpload(uploadFn);

  return (
    <Button onPress={() => start(fileUri, metadata)}>
      {state === 'uploading' ? `${progress}%` : 'Publier'}
    </Button>
  );
}
```

## States

`idle` → `uploading` → `done` | `error`

## Part of Tchomb

| Package | Description |
|---------|-------------|
| [@tchomb/shared-types](https://github.com/yaamwebsolutions/tchomb-shared-types) | Shared TypeScript types |
| [@tchomb/ui](https://github.com/yaamwebsolutions/tchomb-ui) | Design system |
| [@tchomb/api-client](https://github.com/yaamwebsolutions/tchomb-api-client) | Typed HTTP client |
| **@tchomb/upload** | Upload state machine |
| [@tchomb/player](https://github.com/yaamwebsolutions/tchomb-player) | Vertical video player |

## License

MIT
