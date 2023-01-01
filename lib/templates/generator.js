import {readdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import nunjucks from 'nunjucks';


export class Template {

  /** @type {string} */
  name;

  /** @type {string} */
  description;

  /** @type {string} */
  pathname;

  /** @type {boolean} */
  needsInstall = true;

  /** @type {boolean} */
  defaultTemplate = false;
};


export class Generator {

  /**
   * Get template projects list.
   * @return {Promise<Template[]>}
   */
  async getTemplates() {
    const src = dirname(fileURLToPath(import.meta.url));

    const dirs = (await readdir(src, {withFileTypes: true}))
      .filter(f => f.isDirectory());

    const templates = [];
    for (const d of dirs) {
      const pathname = resolve(src, d.name);
      const pkgPath = join(pathname, 'package.json');
      const doc = (await readFile(pkgPath)).toString();
      const json = JSON.parse(doc);

      const t = new Template();
      t.name = d.name;
      t.description = json.description;
      t.pathname = pathname;
      t.needsInstall = !!(json.dependencies || json.devDependencies);
      t.defaultTemplate = d.name === "minimal";

      templates.push(t);
    }

    return this.formatTemplates(templates);
  }

  /**
   * Formats template name field for prettier display.
   * @param {Template[]} templates
   * @return {Template[]}
   */
  formatTemplates(templates) {
    let widest = 0;
    for (let i = 0; i < templates.length; i++) {
      let t = templates[i];
      if (t.name.length > widest) widest = t.name.length;
    }
    for (let i = 0; i < templates.length; i++) {
      let t = templates[i];
      let name = t.name;
      t.name = t.name.padEnd(widest, ' ') + '   ' + t.description;
      t.description = name;
    }
    return templates;
  }

  /**
   * Write template project to destination.
   * @param {string} dest Fully-qualified destination directory to write to.
   * @param {Template} template The templated package (from `getTemplates`).
   * @param {{}} data
   * @return {Promise<void>}
   */
  async generate(dest, template, data) {
    const src = template.pathname;
    await this.renderPath(src, dest, data);
  }

  /**
   * Renders templates under the source directory and writes to dest directory.
   * @param {string} src Fully-qualified source directory containing templates.
   * @param {string} dest Fully-qualified destination directory to write to.
   * @param {{}} data
   * @param {boolean} recursive Recurse through sub-directories.
   * @return {Promise<void>}
   */
  async renderPath(src, dest, data, recursive = true) {
    const files = await readdir(src, {withFileTypes: true});
    for (const f of files) {
      if (f.isFile()) {
        await this.render(join(src, f.name), join(dest, f.name), data);
      } else if (f.isDirectory() && recursive) {
        await this.renderPath(join(src, f.name), join(dest, f.name), data, recursive);
      }
    }
  }

  /**
   * Renders source template to dest.
   * @param {string} src Fully-qualified pathname to template.
   * @param {string} dest Fully-qualified pathname to destination file.
   * @param {{}} data
   * @return {Promise<void>}
   */
  async render(src, dest, data) {
    const template = (await readFile(src)).toString();
    let result = await new Promise((resolve, reject) => {
      nunjucks.renderString(template, data, (err, result) => {
        err && reject(err) || resolve(result);
      })
    });
    await writeFile(dest, result);
  }
}
