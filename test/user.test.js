const app = require("../src/app");
const supertest = require("supertest");
const request = supertest(app);

function fail(err) {
  throw new Error(err);
}

const mainUser = {
  name: "Lorenzo Leffa",
  email: "lorenzo@gmail.com",
  password: "12345",
};

beforeAll(async () => {
  await request
    .post("/user")
    .send(mainUser)
    .then((res) => {
      console.log("Usuário Cadastrado");
    })
    .catch((err) => {
      console.log(err);
    });
});

afterAll(async () => {
  await request
    .delete(`/user/${mainUser.email}`)
    .then((res) => {
      console.log("Usuário deletado");
    })
    .catch((err) => {
      console.log(err);
    });
});

describe("Cadastro de usuário", () => {
  it("should create a user successfully", () => {
    let time = Date.now();
    let email = time + "@gmail.com";

    let user = { name: "Lorenzo", email, password: "123456" };

    return request
      .post("/user")
      .send(user)
      .then((res) => {
        expect(res.statusCode).toEqual(201);
        expect(res.body.email).toEqual(email);
      })
      .catch((err) => {
        fail(err);
      });
  });

  it("Should prevent the user from registering with empty data", () => {
    let user = { name: "", email: "", password: "" };

    return request
      .post("/user")
      .send(user)
      .then((res) => {
        expect(res.statusCode).toEqual(400);
      })
      .catch((err) => {
        fail(err);
      });
  });

  it("should prevent the user from registering with repeated email", () => {
    let time = Date.now();
    let email = time + "@gmail.com";

    let user = { name: "Lorenzo", email, password: "123456" };

    return request
      .post("/user")
      .send(user)
      .then((res) => {
        expect(res.statusCode).toEqual(201);
        expect(res.body.email).toEqual(email);

        return request
          .post("/user")
          .send(user)
          .then((res) => {
            expect(res.statusCode).toEqual(400);
            expect(res.body.err).toEqual("E-mail já cadastrado");
          });
      })
      .catch((err) => {
        fail(err);
      });
  });
});

describe("Autenticação", () => {
  it("Deve me retornar um token quando usuário logar", () => {
    return request
      .post("/auth")
      .send({ email: mainUser.email, password: mainUser.password })
      .then((res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
      })
      .catch((err) => {
        fail(err);
      });
  });

  it("Deve impedir que um usuário que não está cadastrado se logue", () => {
    return request
      .post("/auth")
      .send({ email: "emailaleatorio", password: "senhaaleatoria" })
      .then((res) => {
        expect(res.statusCode).toEqual(403);
        expect(res.body.errors.email).toEqual("O usuário não está cadastrado!");
      })
      .catch((err) => {
        fail(err);
      });
  });

  it("Deve impedir que um usuário com a senha incorreta se logue", () => {
    return request
      .post("/auth")
      .send({ email: mainUser.email, password: "BOLINHA" })
      .then((res) => {
        expect(res.statusCode).toEqual(403);
        expect(res.body.errors.password).toEqual("Usuário ou senha incorretos");
      })
      .catch((err) => {
        fail(err);
      });
  });
});
