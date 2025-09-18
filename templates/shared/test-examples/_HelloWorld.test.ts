// Vue3/React Test Example
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HelloWorld from "@/components/HelloWorld.vue";

describe("HelloWorld", () => {
  it("renders properly", () => {
    const wrapper = mount(HelloWorld, { props: { msg: "Hello Vitest" } });
    expect(wrapper.text()).toContain("Hello Vitest");
  });

  it("should have correct default state", () => {
    const wrapper = mount(HelloWorld, { props: { msg: "Test" } });
    expect(wrapper.vm.count).toBe(0);
  });

  it("should increment count when button clicked", async () => {
    const wrapper = mount(HelloWorld, { props: { msg: "Test" } });
    const button = wrapper.find("button");

    await button.trigger("click");
    expect(wrapper.vm.count).toBe(1);

    await button.trigger("click");
    expect(wrapper.vm.count).toBe(2);
  });

  it("should display correct count in template", async () => {
    const wrapper = mount(HelloWorld, { props: { msg: "Test" } });
    const button = wrapper.find("button");

    await button.trigger("click");
    expect(wrapper.text()).toContain("count is 1");
  });

  it("should apply correct CSS classes", () => {
    const wrapper = mount(HelloWorld, { props: { msg: "Test" } });
    expect(wrapper.find("h1").classes()).toContain("green");
  });
});
