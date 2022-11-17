type XmlElement = string | {
  tagName: string,
  attributes: Record<string, string>,
  children: XmlElement[],
  pos: number
}

type UpperCaseCharacter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
// add additional non-letter characters to this union as desired
type Character = UpperCaseCharacter | Lowercase<UpperCaseCharacter>;

type CompactXmlElement = {
  [key: string]: {
    "_"?: string,
    [key: `\$${string}`]: string,
    [key: `${Character}${string}`]: CompactXmlElement[]
  }
}

export function compact(element: XmlElement): CompactXmlElement | string {
  if (typeof element === "string") return element;
  let output: any = {};
  for (let [k, v] of Object.entries(element.attributes)) output[`\$${k}`] = v;
  for (let child of element.children) {
    let compacted = compact(child);
    if (typeof compacted === "string") {
      output._ = compacted;
      continue;
    }
    let [k, v] = Object.entries(compacted)[0]!;
    if (!output[k]) output[k] = [];
    output[k].push(v);
  }
  return {[element.tagName]: output};
}
