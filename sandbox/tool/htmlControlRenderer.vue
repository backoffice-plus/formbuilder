<template>
  <control-wrapper
      v-bind="controlWrapper"
      :styles="styles"
      :isFocused="isFocused"
      :appliedOptions="appliedOptions"
  >
    <prism-editor
        class="htmleditor"
        v-model="control.data"
        :highlight="highlighter" line-numbers

        id="control.id + '-input'"
        :disabled="!control.enabled"
        :autofocus="appliedOptions.focus"
        :placeholder="appliedOptions.placeholder"
        @input="onChange"
        @focus="isFocused = true"
        @blur="isFocused = false"
    />
  </control-wrapper>
</template>

<style scoped>
.htmleditor {
  @apply
  font-mono
  p-1

  bg-gray-800
  text-gray-100
}
</style>

<script>
import {rankWith,} from '@jsonforms/core';
import {defineComponent} from 'vue';
import {rendererProps, useJsonFormsControl} from '@jsonforms/vue';
import {default as ControlWrapper} from '@jsonforms/vue-vanilla/src/controls/ControlWrapper.vue';
import {useVanillaControl} from '@jsonforms/vue-vanilla/src/util';
import {and, optionIs, uiTypeIs} from "@jsonforms/core/src/testers/testers";

import {PrismEditor} from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';

const htmlControlRenderer = defineComponent({
  name: 'html-control-renderer',
  components: {
    ControlWrapper,
    PrismEditor
  },
  props: {
    ...rendererProps()
  },
  setup(props) {
    const c = useVanillaControl(useJsonFormsControl(props), target => target.value || undefined);

    const highlighter = (code) => {
      return highlight(code, languages.markup, 'html');
    };

    return {
      ...c,
      highlighter
    };
  }
});

export default htmlControlRenderer;
export const entry = {
  renderer: htmlControlRenderer,
  tester: rankWith(2, and(uiTypeIs('Control'), optionIs('html', true)))
};
</script>
