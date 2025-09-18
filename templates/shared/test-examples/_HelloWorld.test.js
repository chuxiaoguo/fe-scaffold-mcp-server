// Vue2 Test Example
import { shallowMount } from "@vue/test-utils";
import HelloWorld from "@/components/HelloWorld.vue";

describe("HelloWorld.vue", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message";
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });

  it("should have correct default data", () => {
    const wrapper = shallowMount(HelloWorld);
    expect(wrapper.vm.count).toBe(0);
  });

  it("should increment count when button clicked", async () => {
    const wrapper = shallowMount(HelloWorld);
    const button = wrapper.find("button");

    await button.trigger("click");
    expect(wrapper.vm.count).toBe(1);

    await button.trigger("click");
    expect(wrapper.vm.count).toBe(2);
  });

  it("should display correct count in template", async () => {
    const wrapper = shallowMount(HelloWorld);
    const button = wrapper.find("button");

    await button.trigger("click");
    expect(wrapper.text()).toContain("count is 1");
  });
});
