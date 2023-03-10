<template>

  <control-wrapper
      v-bind="controlWrapper"
      :styles="styles"
      :isFocused="!!isFocused"
      :appliedOptions="appliedOptions"
      :id="control.id + '-input'"
  >
    <input :type="passwordVisible ? 'text' : 'password'"
           data-type="password"
           v-model="control.data"
           :id="control.id + '-input'"
           :class="styles.control.input"
           :disabled="!control.enabled"
           :autofocus="appliedOptions.focus"
           :placeholder="appliedOptions.placeholder"
           :required="control.required"
           @change="onChange"
    />

    <!--
      :maxlength="input.appliedOptions.restrict ?? control.schema.maxLength"
      :size="(input.appliedOptions.trim && control.schema.maxLength !== undefined )?? control.schema.maxLength"
    -->

    <button @click="passwordVisible=!passwordVisible"></button>

  </control-wrapper>
</template>

<script>
import {defineComponent} from "vue";
import {rendererProps, useJsonFormsControl} from '@jsonforms/vue2';
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue2-vanilla";
import {formatIs, isStringControl, rankWith, and} from "@jsonforms/core";


/**
 * https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/controls/PasswordControlRenderer.vue
 */
const renderer = defineComponent({
  components: {
    ControlWrapper
  },
  props: {
    ...rendererProps()
  },
  data() {
    return {
      passwordVisible: false,
    }
  },
  setup(props) {
    return useVanillaControl(useJsonFormsControl(props), target => target.value || undefined);

  },
  computed: {

  }
});

export default renderer;
export const entry = {
  renderer: renderer,
  tester: rankWith(2, and(isStringControl, formatIs('password')))
};

</script>
