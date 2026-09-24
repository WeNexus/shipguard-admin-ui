import { InlineStack, Text } from "@shopify/polaris";
import { WIDGET_ICONS } from "./widget-icons";

const IconPicker = ({ selected }: { selected: string }) => (
  <InlineStack gap="200" blockAlign="center">
    <Text as="span" fontWeight="bold">
      Insurance icon
    </Text>
    <InlineStack gap="200" wrap>
      {WIDGET_ICONS.map((src) => (
        <div
          key={src}
          className={`flex h-[60px] w-[60px] items-center justify-center rounded-lg p-1 ${
            src === selected
              ? "ring-2 ring-green-500"
              : "border border-dashed border-gray-300"
          }`}
        >
          <img src={src} alt="" className="max-h-full max-w-full" />
        </div>
      ))}
    </InlineStack>
  </InlineStack>
);

export default IconPicker;
