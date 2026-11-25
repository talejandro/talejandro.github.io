"use client";

import type { ReactNode } from "react";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { T, usePreferences, type Bilingual } from "./preferences";

type EditorTab = Bilingual & { value: string };

export function EditorTabs({
  label,
  tabs,
  children,
}: {
  label: Bilingual;
  tabs: EditorTab[];
  children: ReactNode;
}) {
  const { language } = usePreferences();
  return (
    <Tabs
      defaultValue={tabs[0].value}
      activation="automatic"
      loop
      className="min-w-0"
    >
      <TabsList aria-label={label[language]} className="editor-tabs">
        {tabs.map(({ value, es, en }) => (
          <TabsTab key={value} value={value}>
            <T es={es} en={en} />
          </TabsTab>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

export function EditorPanel({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  return (
    <TabsPanel value={value} keepMounted className="editor-page">
      {children}
    </TabsPanel>
  );
}
