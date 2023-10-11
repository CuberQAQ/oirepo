#!/usr/bin/env node
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import Clui from "clui";
import fs, { writeFileSync } from "fs";
import ConfigStore from "configstore";
import { Command, program } from "commander";
import path from "path";
let config = new ConfigStore();
let version = "1.0.0";
program
  .name("oirepo")
  .aliases(["orp", "oirp", "oirep"])
  .description(
    "Simple tool for OIer to save C++ source file into repo and replace current file with template source file.\n一个帮助OIer归档和清理垃圾代码的蒟蒻小工具..."
  )
  .version(version);
program.addHelpCommand("help [command]", "输出使用帮助");
function printHeadline() {
  clear();
  return (
    chalk.redBright(figlet.textSync("OI REPO", "Speed")) +
    chalk.gray(version) +
    chalk.italic(
      chalk.gray("\nPowered by ") + chalk.yellowBright("@CuberQAQ")
    ) +
    " <" +
    chalk.underline("https://github.com/CuberQAQ/oirepo") +
    ">"
  );
}
program.addHelpText("beforeAll", printHeadline);
program
  .command("save")
  .alias("s")
  .description("将当前源文件保存至仓库")
  .argument("<saveName>", "源文件保存后的文件名")
  .option("-f, --force", "直接覆盖可能存在的目标文件")
  .option("-s, --source <sourceName>", "当前源文件名或路径")
  .action((saveName, opts) => {
    copyIntoRepoTask(saveName, opts);
  });

program
  .command("clear")
  .alias("c")
  .description("清空当前源文件并载入模板")
  .argument("[template]", "指定特定模板文件名")
  .option("-b, --blank", "直接载入空白文件")
  .option("-s, --source <sourceName>", "当前源文件名或路径")
  .action((template, opts) => {
    loadTemplateTask(template, opts);
  });

program
  .command("push")
  .description("将当前源文件保存至仓库并载入模板")
  .alias("p")
  .argument("<saveName>", "源文件保存后的文件名")
  .argument("[template]", "指定特定模板文件名")
  .option("-b, --blank", "直接载入空白文件")
  .option("-s, --source <sourceName>", "当前源文件名或路径")
  .option("-f, --force", "直接覆盖可能存在的目标文件")
  .action((saveName, template, opts) => {
    copyIntoRepoTask(saveName, opts);
    loadTemplateTask(template, opts);
  });

program
  .command("upgrade")
  .description("检查更新")
  .alias("u")
  .option("-f, --force", "直接覆盖可能存在的目标文件")
  .action((opts) => {
    console.log(printHeadline() + "\n");
    let status = new Clui.Spinner("Please Wait...");
    status.start();
    let prog = new Clui.Progress(20);
    let i = 0.1;
    status.message("Geting Latest Package...");
    setTimeout(() => {
      let s = setInterval(() => {
        i += 0.1;
        if (i >= 1)
          status.message(
            '其实只要"npm update oirepo"就可以了...更新功能还没做'
          );
        else status.message("Updating...     " + prog.update(i));
        if (i >= 3) s.unref();
      }, 800);
    }, 1000);
    // setTimeout(() => status.stop(), 5000);
  });
program
  .command("config")
  .description("配置oirepo")
  .alias("set")
  .option("--reset", "清除所有配置")
  .option("-l,--repo-location [location]", "OIREPO仓库的路径")
  .option("-s,--sourcefile [filename]", "未指定时的源文件名(含扩展名)")
  .option("-t,--template-location [location]", "模板文件的路径")
  .option("-d,--template-default [location]", "未指定时的模板文件(含扩展名)")
  .action((opts) => {
    // console.log(opts);
    if (opts.reset) {
      resetConfig();
    }
    if (opts.repoLocation) {
      if (typeof opts.repoLocation == "boolean") {
        setConfig("repoLocation");
      } else {
        if (!fs.existsSync(opts.repoLocation))
          program.error(
            chalk.dim.bgRed("ERROR") + " 给定的 repo-location 路径不存在"
          );
        if (!fs.statSync(opts.repoLocation).isDirectory())
          program.error(
            chalk.dim.bgRed("ERROR") + " 给定的 repo-location 是文件而不是目录"
          );
        setConfig("repoLocation", opts.repoLocation);
      }
    }
    if (opts.sourcefile) {
      if (typeof opts.repoLocation == "boolean") {
        setConfig("sourcefile");
      } else {
        setConfig("sourcefile", opts.sourcefile);
      }
    }
    if (opts.templateLocation) {
      if (typeof opts.templateLocation == "boolean") {
        setConfig("templateLocation");
      } else {
        if (!fs.existsSync(opts.templateLocation))
          program.error(
            chalk.dim.bgRed("ERROR") + " 给定的 template-location 路径不存在"
          );
        if (!fs.statSync(opts.templateLocation).isDirectory())
          program.error(
            chalk.dim.bgRed("ERROR") +
              " 给定的 template-location 是文件而不是目录"
          );
        setConfig("templateLocation", opts.templateLocation);
      }
    }
    if (opts.templateDefault) {
      if (typeof opts.templateDefault == "boolean") {
        setConfig("templateDefault");
      } else {
        setConfig("templateDefault", opts.templateDefault);
      }
    }
  });
program.parse();
function getConfig(key, must, tipOpt, beforeError) {
  if (!config.has("oirepo." + key)) {
    if (must) {
      beforeError && beforeError();
      program.error(
        chalk.dim.bgRed("ERROR") +
          " 未配置 " +
          key +
          ' ，请使用"oirepo config ' +
          tipOpt +
          '"进行配置'
      );
    }
    return;
  } else return config.get("oirepo." + key);
}
function setConfig(key, newValue) {
  if (newValue) {
    console.log(
      chalk.bgYellow.white("CONFIG") +
        " " +
        key +
        " = " +
        config.get("oirepo." + key) +
        " -> " +
        newValue
    );
    config.set("oirepo." + key, newValue);
  } else {
    console.log(
      chalk.bgYellow.white("CONFIG") +
        " " +
        key +
        " = " +
        config.get("oirepo." + key)
    );
  }
}
function resetConfig() {
  config.delete("oirepo");
  console.log(chalk.bgGreen("DONE") + " 已清除oirepo的所有配置！");
}
function copyIntoRepoTask(saveName, opts) {
  // console.log(opts);
  let repoLocation = getConfig("repoLocation", true, "--repo-location=<dir>");
  if (
    !(saveName.trim().endsWith("\\") || saveName.trim().endsWith("/")) &&
    path.extname(saveName) == ""
  ) {
    let pathObj = path.parse(saveName);
    pathObj.base += ".cpp";
    saveName = path.format(pathObj);
  }
  let src = "";
  if (opts.source) {
    if (!fs.existsSync(opts.source))
      program.error(chalk.dim.bgRed("ERROR") + " --source 指定的源文件不存在");
    if (fs.statSync(opts.source).isDirectory())
      program.error(
        chalk.dim.bgRed("ERROR") + " --source 指定的源文件是目录而不是文件"
      );
    src = opts.source;
  } else {
    src = getConfig("sourcefile", true, "--sourcefile=<filename>");
    if (!fs.existsSync(src))
      program.error(
        chalk.dim.bgRed("ERROR") + " sourcefile 指定的源文件不存在:" + src
      );
    if (fs.statSync(src).isDirectory())
      program.error(
        chalk.dim.bgRed("ERROR") +
          " sourcefile 指定的源文件是目录而不是文件:" +
          src
      );
  }
  copyOperation({
    dest: path.isAbsolute(saveName)
      ? saveName
      : path.join(repoLocation, saveName),
    src: src,
    error: (str) => program.error(str),
    force: opts.force,
  });
}
function loadTemplateTask(template, opts) {
  // console.log(opts);
  // source
  let src = "";
  if (opts.source) {
    if (!fs.existsSync(opts.source))
      program.error(chalk.dim.bgRed("ERROR") + " --source 指定的源文件不存在");
    if (fs.statSync(opts.source).isDirectory())
      program.error(
        chalk.dim.bgRed("ERROR") + " --source 指定的源文件是目录而不是文件"
      );
    src = opts.source;
  } else {
    src = getConfig("sourcefile", true, "--sourcefile=<filename>");
    if (!fs.existsSync(src))
      console.log(chalk.dim.bgGreen("CREATE") + " " + src);
    if (fs.statSync(src).isDirectory())
      program.error(
        chalk.dim.bgRed("ERROR") +
          " sourcefile 指定的源文件是目录而不是文件:" +
          src
      );
  }
  if (opts.blank) {
    // blank
    writeFileSync(src, "");
    console.log(chalk.dim.bgBlueBright("CLEAR") + ' "" > ' + src);
  } else {
    // template dir
    let templateLocation = getConfig(
      "templateLocation",
      true,
      "--template-location=<dir>"
    );
    // template filename
    let templateFilename = template;
    if (!template) {
      templateFilename = getConfig(
        "templateDefault",
        true,
        "--template-default=<dir>",
        () =>
          console.log(
            chalk.dim.bgCyan(" TIP ") +
              ' 请通过"oirepo clear [template]"的 template 参数指定模板文件，或配置 templateDefault 设置默认模板文件，来帮助oirepo查找指定的模板！'
          )
      );
    }
    if (!fs.existsSync(templateLocation)) {
      error(
        chalk.dim.bgRed("ERROR") +
          " 模板位置不存在:" +
          chalk.gray(templateLocation)
      );
      return;
    }
    if (!fs.statSync(templateLocation).isDirectory()) {
      error(
        chalk.dim.bgRed("ERROR") +
          " 模板位置不是目录:" +
          chalk.gray(templateLocation)
      );
      return;
    }
    let templatePath = path.join(templateLocation, templateFilename),
      templatePathExted = templatePath;
    if (
      !(
        templatePath.trim().endsWith("\\") || templatePath.trim().endsWith("/")
      ) &&
      path.extname(templatePath) == ""
    ) {
      let pathObj = path.parse(templatePath);
      pathObj.base += ".cpp";
      templatePathExted = path.format(pathObj);
    }
    if (!fs.existsSync(templatePath) && !fs.existsSync(templatePathExted)) {
      program.error(
        chalk.dim.bgRed("ERROR") +
          " 模板文件不存在:" +
          chalk.gray(templatePathExted)
      );
      return;
    }
    if (fs.existsSync(templatePath)) fs.copyFileSync(templatePath, src);
    else if (fs.existsSync(templatePathExted))
      fs.copyFileSync(templatePathExted, src);
    console.log(
      chalk.dim.bgBlueBright("CLEAR") + " " + templateFilename + " > " + src
    );
  }
}
function copyOperation({ src, dest, error, force }) {
  if (!fs.existsSync(path.dirname(dest))) {
    error(
      chalk.dim.bgRed("ERROR") + " 位置不存在:" + chalk.gray(path.dirname(dest))
    );
    return;
  }
  if (!fs.statSync(path.dirname(dest)).isDirectory()) {
    error(
      chalk.dim.bgRed("ERROR") +
        " 目标位置不是目录:" +
        chalk.gray(path.dirname(dest))
    );
    return;
  }
  if (!fs.existsSync(src)) {
    error(chalk.dim.bgRed("ERROR") + " 源文件不存在:" + chalk.gray(src));
    return;
  }
  if (fs.existsSync(dest) && !force) {
    error(
      chalk.dim.bgRed("ERROR") +
        " 目标文件已存在:" +
        chalk.gray(src) +
        "\n若使用强制覆盖，请添加 -f 或 --force 选项"
    );
    return;
  }
  // COPY
  fs.copyFileSync(src, dest);
  console.log(chalk.bgGreen.white("COPY") + " " + src + " -> " + dest);
}
