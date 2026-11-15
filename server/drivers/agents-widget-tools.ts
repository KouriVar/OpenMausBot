// The chat-widget tool of the agents catalog: definitions only, sent to the model on every turn.
export const WIDGET_TOOL_DEFINITIONS = [
  {
    name: "show_widget",
    description:
      "Show an interactive widget in this chat: one question answered with a tap instead of typing (a time, a day, one of a few options), a form prefilled (defaultValue) with what they want to change, or a live status. Ask only what you cannot find or sensibly default, one question per widget; for a pick-one, a Card with a Row of Buttons, one per option (onClickAction sends it in one tap), at most six. Several fields only to change something that exists, or for required details you cannot default; \"remind me every weekday\" gets a TimePicker and a DayPicker. A plain yes or no needs none: ask it in your message, and a word or a 👍 or 👎 answers it. Data, comparisons and results go in a markdown table in your message instead, which the chat can copy and export. `widget` is one JSON tree. The root is {type:\"Card\"|\"ListView\", title?, caption?, children:[...], confirm?:{label,action}, cancel?:{label,action}}. Nodes: Row, Col, Box, Spacer, Divider, Text, Title, Caption, Markdown, Badge{label,color}, Icon{name}, Image{src}, Progress{value 0-1, or value and max}, Chart{data,series:[{type,dataKey}],xAxis}, Button{label,onClickAction}, Form{onSubmitAction,children}. Fields, each with a name and a short label: Select|RadioGroup{options:[{label,value}],ui?}, DatePicker{min?,max?} (YYYY-MM-DD), TimePicker{min?,max?,step?} (HH:MM, 24-hour), DayPicker (days of the week, sent as \"mon,wed,fri\"), Checkbox, Input, Textarea. A ListView holds ListViewItem{children}; to have the person choose one row, give the ListView a name and each row a value, and confirm sends the pick. A choice field's ui picks its skin from its options: list, samples (sample), swatches (hex), fonts (font), thumbs, slider, range, dates, time, emoji, toggle, grid, pad (axes, cells), layouts (layout), map (lat, lng); an unusable skin falls back to list. Select, RadioGroup and such a list also let the person type their own answer instead; set allowOther:false only when nothing but an option will do. An action is {type,payload?}; {type:\"open_url\",payload:{url}} opens a link. Labels are plain words, no emoji. A press (confirm, cancel, a button) arrives as their next message, even mid-turn; if they type something else instead, that is their answer. Do what does not depend on it, then end your turn; never wait for it. To replace a widget in place (a progress bar moving, a status changing), call this again with the widget_id it returned (was update_widget); one the person already answered cannot be replaced, so show a new one. Keep it small: one confirm, one cancel, at most 8 rows. Never ask for passwords here. In rooms it is view-only: ask in text there.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        widget: { type: "object", additionalProperties: true },
        fallback_text: { type: "string", description: "Optional plain text for clients without widgets." },
        widget_id: { type: "string", description: "Only to replace a widget you showed." },
      },
      required: ["widget"],
    },
  },
  {
    name: "ask_fill",
    description:
      "Ask the person to fill blanks in the answer you are writing, when the rest of the answer depends on their values. Prefer a blank inside the sentence (<blank>{key,ask,kind,ui,options,min,max,step,unit}</blank>); use this card only when you need four or more values at once or the answer is a form. Write the answer up to the missing part, then call ask_fill with one Card whose fields are the blanks, and end your turn: the card collects the values and sends them back, and you continue from where you stopped. Put ui on a Select, RadioGroup or MultiSelect field instead of leaving every field a dropdown: dates, time, map (options with lat/lng), swatches (hex), fonts (font), layouts (layout), toggle, range (min,max,step,unit), slider, pad (axes and cells), grid (nine options), samples (a sample sentence), emoji, or list as the fallback. Input with inputType \"number\" and short Input still work. Every field needs a name and a short label. The person does not press send: the card goes on as soon as every field is filled. Do not repeat the values in text, and do not ask for passwords. In a room this is view-only.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        widget: { type: "object", additionalProperties: true, description: "The fill card tree; fields are the blanks." },
        fallback_text: { type: "string", description: "Optional plain-text version for clients that cannot draw widgets." },
      },
      required: ["widget"],
    },
  },
];
