import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { execSync } from "node:child_process";
import { Enum } from 'enum-plus'

async function select<T extends {label:string,value:string}[]>(options:T, message:string) {
  // options: [{ label: string, value: any }]
  return new Promise<T[number]["value"]>((resolve) => {
    const rl = readline.createInterface({ input, output });

    readline.emitKeypressEvents(input, rl);
    if (input.isTTY) input.setRawMode(true);

    let index = 0;

    function render() {
      output.write("\x1Bc"); // 清屏
      console.log(message + "\n");
      options.forEach((opt, i) => {
        const label = opt.label ?? String(opt.value);

        if (i === index) {
          console.log(`> \x1b[32m${label}\x1b[0m`);
        } else {
          console.log(`  ${label}`);
        }
      });
    }

    render();

    input.on("keypress", (_, key) => {
      if (key.name === "up") {
        index = (index - 1 + options.length) % options.length;
        render();
      } else if (key.name === "down") {
        index = (index + 1) % options.length;
        render();
      } else if (key.name === "return") {
        rl.close();
        if (input.isTTY) input.setRawMode(false);
        resolve(options[index].value);
      } else if (key.name === "c" && key.ctrl) {
        rl.close();
        if (input.isTTY) input.setRawMode(false);
        process.exit();
      }
    });
  });
}

const BuildTarget = Enum({
    desktop: {
        value: "desktop",
        label: "电脑端脚本",
        description: "🖥️  打包成电脑端脚本",
    },
    mobile: {
        value: "mobile",
        label: "手机端脚本",
        description: "📱 打包成手机端脚本",
    }
})

async function main() {
  if (!process.stdin.isTTY) {
    // 非 TTY 情况：为了不报错，选择默认 desktop
    console.log(`非交互终端，使用默认构建：${ BuildTarget.desktop }`);
    execSync(`vite build --mode ${ BuildTarget.desktop }`, { stdio: "inherit" });
    return;
  }

const target = await select(
  [
    { label: BuildTarget.named.desktop.raw.description, value: BuildTarget.desktop },
    { label: BuildTarget.named.mobile.raw.description, value: BuildTarget.mobile }
  ],
  "请选择构建目标："
);

  console.log(`\n📦 开始构建${BuildTarget.raw(target).label}\n`);

  execSync(`vite build --mode ${target}`, { stdio: "inherit" });
}

main();

