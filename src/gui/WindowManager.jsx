import React, { Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import Window from './Window.jsx';
import useWindowStore from './store/useWindowStore.js';
import registry from './appRegistry.js';

/**
 * WindowManager — renders all non-minimized windows.
 *
 * AnimatePresence here tracks window mount/unmount.
 * Window returns Rnd as root (for correct drag coords), so we wrap
 * each Window in a keyed React.Fragment that AnimatePresence can track.
 * The motion.div inside Window handles the visual open/close animation.
 */
export default function WindowManager() {
  const { openWindows, getFocusedId } = useWindowStore();
  const focusedId = getFocusedId();

  const visible = openWindows.filter((w) => !w.minimized);

  return (
    // AnimatePresence needs direct children with `key` to track exits.
    // Since Window's root is Rnd (not motion.div), we provide the key on
    // the Window element itself — React unmounts Window when it leaves the
    // array, and the motion.div inside plays its exit animation via layout.
    <AnimatePresence mode="sync">
      {visible.map((win) => {
        const app = registry[win.appId];
        if (!app) return null;
        const AppComponent = app.component;

        return (
          <Window key={win.id} win={win} isFocused={win.id === focusedId}>
            <Suspense
              fallback={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--gui-text-muted)',
                  fontSize: 13,
                  fontFamily: 'var(--gui-font-mono)',
                }}>
                  loading…
                </div>
              }
            >
              <AppComponent winId={win.id} />
            </Suspense>
          </Window>
        );
      })}
    </AnimatePresence>
  );
}
