import { widgetSkin, widgetString, type WidgetNode } from "../../../shared/widget";
import { OptionSkin } from "./OptionSkin";
import {
  useWidgetForm, widgetFieldId, WidgetCheckbox, WidgetDatePicker, WidgetInput, WidgetMultiSelect, WidgetRadioGroup, WidgetSelect, WidgetTextarea,
} from "./WidgetControls";
import { WidgetDayPicker } from "./WidgetDayPicker";
import { WidgetTimePicker } from "./WidgetTimePicker";
import type { WidgetWhere } from "./WidgetNodes";

export const WIDGET_FIELD_TYPES: ReadonlySet<string> = new Set(["Select", "DatePicker", "TimePicker", "DayPicker", "Checkbox", "RadioGroup", "MultiSelect", "Input", "Textarea"]);
const BARE = new Set(["Select", "DatePicker", "TimePicker", "DayPicker", "Input"]);
const FILLS = new Set(["Select", "DatePicker", "TimePicker", "MultiSelect", "Input", "Textarea"]);
export const WIDGET_FIELD_SHARE = "1 1 160px";

export const WIDGET_CAPTION = "ms-0.5 block text-[12px] leading-4 text-ink-secondary";

export function WidgetFieldView({ node, where }: { node: WidgetNode; where: WidgetWhere }) {
  const form = useWidgetForm();
  if (node.type === "Checkbox") return <WidgetCheckbox node={node} />;
  const name = widgetString(node, "name") ?? "";
  const label = widgetString(node, "label");
  const captioned = label !== undefined && !form.labelled.has(name);
  const inRow = where.axis === "row";
  if ((node.type === "Select" || node.type === "RadioGroup" || node.type === "MultiSelect") && widgetString(node, "ui")) {
    return <WidgetSkinField node={node} />;
  }
  const bare = inRow && !captioned && node.block !== true && BARE.has(node.type);
  const group = node.type === "RadioGroup" || node.type === "DayPicker" || node.type === "MultiSelect";
  const captionId = `${widgetFieldId(form, name)}-label`;
  const labelledBy = captioned && group ? captionId : undefined;
  const control = node.type === "Select" ? <WidgetSelect node={node} bare={bare} />
    : node.type === "DatePicker" ? <WidgetDatePicker node={node} bare={bare} />
      : node.type === "TimePicker" ? <WidgetTimePicker node={node} bare={bare} />
        : node.type === "DayPicker" ? <WidgetDayPicker node={node} labelledBy={labelledBy} end={bare} />
          : node.type === "RadioGroup" ? <WidgetRadioGroup node={node} labelledBy={labelledBy} />
            : node.type === "MultiSelect" ? <WidgetMultiSelect node={node} labelledBy={labelledBy} />
            : node.type === "Input" ? <WidgetInput node={node} bare={bare} />
              : <WidgetTextarea node={node} />;
  const shares = inRow && !bare && (captioned || FILLS.has(node.type));
  if (!captioned && !shares) return control;
  return (
    <div className="flex min-w-0 flex-col gap-1.5" style={shares ? { flex: WIDGET_FIELD_SHARE } : undefined}>
      {captioned && (group
        ? <div id={captionId} dir="auto" className={WIDGET_CAPTION}>{label}</div>
        : <label id={captionId} htmlFor={widgetFieldId(form, name)} dir="auto" className={WIDGET_CAPTION}>{label}</label>)}
      {control}
    </div>
  );
}

/** A choice field whose `ui` asks for a skin. The value is still the same one
 * string the card sends; only the control that writes it changes. */
function WidgetSkinField({ node }: { node: WidgetNode }) {
  const form = useWidgetForm();
  const name = widgetString(node, "name") ?? "";
  const label = widgetString(node, "label");
  const disabled = form.locked || node.disabled === true;
  const captionId = `${widgetFieldId(form, name)}-label`;
  const spec = widgetSkin(node);
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && <div id={captionId} dir="auto" className={WIDGET_CAPTION}>{label}</div>}
      <div data-widget-field={name}>
        <OptionSkin spec={spec} value={typeof form.values[name] === "string" ? form.values[name] as string : ""}
          onChange={(value) => form.setValue(name, value)} disabled={disabled} labelledBy={label ? captionId : undefined}
          ariaLabel={label ?? name} onOther={(text) => {
            if (!Object.hasOwn(form.other, name)) form.chooseOther(name);
            form.setOther(name, text);
          }} />
      </div>
    </div>
  );
}
