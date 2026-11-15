// OMB's A2UI catalog: the basic v1.0 component APIs, drawn by this app's own
// controls, plus the Table this fork adds to both ends.
import { z } from "zod3";
import { CommonSchemas } from "@a2ui/web_core/v1_0";
import type { ComponentApi } from "@a2ui/web_core";
import {
  AudioPlayerApi, ButtonApi, CardApi, CheckBoxApi, ChoicePickerApi, ColumnApi, DateTimeInputApi, DividerApi, IconApi, ImageApi, ListApi, ModalApi, RowApi, SliderApi, TabsApi, TextApi, TextFieldApi, VideoApi,
} from "@a2ui/web_core/catalogs/basic/v1";
import { A2UI_CATALOG_ID } from "../../../shared/a2ui";

export const A2UI_BASIC_APIS = {
  Text: TextApi, Image: ImageApi, Icon: IconApi, Video: VideoApi, AudioPlayer: AudioPlayerApi,
  Row: RowApi, Column: ColumnApi, List: ListApi, Card: CardApi, Tabs: TabsApi, Modal: ModalApi, Divider: DividerApi,
  Button: ButtonApi, TextField: TextFieldApi, CheckBox: CheckBoxApi, ChoicePicker: ChoicePickerApi,
  Slider: SliderApi, DateTimeInput: DateTimeInputApi,
} as const;

export const tableApi = {
  name: "Table",
  schema: z.object({
    columns: z.array(CommonSchemas.DynamicString),
    rows: z.array(z.array(CommonSchemas.DynamicString)),
    weight: z.number().optional(),
  }).strict(),
} satisfies ComponentApi;

export { A2UI_CATALOG_ID };
