# New Vortex Arcade game

1. Copy this folder to `games/<game-id>/`.
2. Add `index.tsx` exporting one `GameDefinition`.
3. Keep local assets beside the game and declare them in `resources.ts`.
4. Export the declaration from the game definition:

```ts
import { resources } from './resources';

export const MyGame: GameDefinition = {
  // ...
  resources,
};
```

The registry discovers every `games/*/index.ts` and `games/*/index.tsx` automatically.
