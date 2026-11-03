import { Fragment, createElement, type ReactNode } from "react";

const allowedTags = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "sub",
  "sup",
  "div",
  "span",
]);

const blockedTags = new Set(["script", "style", "iframe", "object", "embed", "svg", "math"]);

function toSafeNodes(node: Node, key: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const element = node as Element;
  const tagName = element.tagName.toLocaleLowerCase("en-US");
  if (blockedTags.has(tagName)) return null;

  const children = Array.from(element.childNodes).map((child, index) =>
    toSafeNodes(child, `${key}-${index}`),
  );
  if (!allowedTags.has(tagName)) return <Fragment key={key}>{children}</Fragment>;

  return createElement(tagName, { key }, ...children);
}

export function OrdoHtmlContent({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  if (!html?.trim() || typeof DOMParser === "undefined") return null;
  const document = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(document.body.childNodes).map((node, index) =>
    toSafeNodes(node, `ordo-${index}`),
  );

  return <div className={className}>{nodes}</div>;
}
