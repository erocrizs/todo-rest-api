require("module-alias/register");
require("dotenv").config({ path: ".env.test" });
require("./_db");
const chai = require("chai");

chai.use(require("chai-http"));
chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));
