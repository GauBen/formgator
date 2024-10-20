import { tags } from "$lib";
import * as fg from "formgator";
import { formgate } from "formgator/sveltekit";

export const actions = {
  default: formgate(
    {
      title: fg.text({ required: true, maxlength: 255 }),
      date: fg.datetimeLocal({ required: true }).asDate(),
      tags: fg.select(tags, { multiple: true }),
      banner: fg.file(),
      newsletter: fg.checkbox(),
      content: fg.textarea({ required: true }),
    },
    async (data) => {
      console.log(data);
    },
  ),
};
