import { DataSource } from "typeorm";
import request from "supertest";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Headers } from "../../src/types/index.types";
import { Roles } from "../../src/contants/index.constant";

import { User } from "../../src/entity/User.entity";
import { RefreshToken } from "../../src/entity/RefreshToken.entity";

import { hashPassword } from "../../src/utils/bcrypt.utlis";
import { isJwt } from "../../src/utils/index.utlis";

describe("POST /auth/login", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all field", () => {
        it("should return 200 status code", async () => {
            // Arange
            const loginUserData = {
                email: "sameer@gmail.com",
                password: "$@meer1234",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            // Asserts
            expect(response.statusCode).toBe(200);
        });

        it("should return valid json response", async () => {
            // Arange
            const loginUserData = {
                email: "sameer@gmail.com",
                password: "$@meer1234",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            // Asserts
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should return id of logged user", async () => {
            // Arange
            const loginUserData = {
                email: "sameer@gmail.com",
                password: "$@meer1234",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            // Asserts
            expect((response.body as Record<string, string>).id).toBeDefined();
        });

        it("should return 400 status code if email is incorrect", async () => {
            // Arange
            const loginUserData = {
                email: "sameer1@gmail.com",
                password: "$@meer1234",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            // Asserts
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if password is incorrect", async () => {
            // Arange
            const loginUserData = {
                email: "sameer@gmail.com",
                password: "$@meer123",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            // Asserts
            expect(response.statusCode).toBe(400);
        });

        it("should return the refresh token and access token inside a cookie", async () => {
            // Arange
            const loginUserData = {
                email: "sameer@gmail.com",
                password: "$@meer1234",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            // Asserts
            let accsessToken = null;
            let refreshToken = null;
            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accsessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(":")[0].split("=")[1];
                }
            });

            expect(accsessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
        });

        it("should return true if jwt token is valid", async () => {
            // Arange
            const loginUserData = {
                email: "sameer@gmail.com",
                password: "$@meer1234",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            // Asserts
            let accsessToken = null;
            let refreshToken = null;
            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accsessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(isJwt(accsessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it("should presist the refresh token in the database", async () => {
            // Arange
            const loginUserData = {
                email: "sameer@gmail.com",
                password: "$@meer1234",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            // Asserts
            const refreshTokenRespository =
                connection.getRepository(RefreshToken);

            const token = await refreshTokenRespository
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(token).toHaveLength(1);
        });
    });

    describe("Given field are missing ", () => {
        it("should return 400 if email is missing", async () => {
            // Arange
            const loginUserData = {
                email: "",
                password: "$@meer1234",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            // Asserts
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 if password is missing", async () => {
            // Arange
            const loginUserData = {
                email: "sameer@gmail.com",
                password: "",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            // Asserts
            expect(response.statusCode).toBe(400);
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim the all fields and return 200 status code", async () => {
            // Arange
            const loginUserData = {
                email: "  sameer@gmail.com  ",
                password: "  $@meer1234",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            // Asserts
            expect(response.statusCode).toBe(200);
        });

        it("should return 400 status code if Lastname is not a valid", async () => {
            // Arange
            const loginUserData = {
                email: "sameergmail.com",
                password: "$@meer1234",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            expect(response.statusCode).toBe(400);
        });
    });

    describe("error format received from express validator", () => {
        it("should return array of validation error", async () => {
            // Arange
            const loginUserData = {
                email: "sameergmail.com",
                password: "$@meer1234",
            };

            // Act
            const userRepository = connection.getRepository(User);
            // converting normal password to hashed password
            const hashedPassword = await hashPassword("$@meer1234");

            await userRepository.save({
                firstName: "Sameer",
                lastName: "Kumar",
                email: "sameer@gmail.com",
                password: hashedPassword,
                role: Roles.Customer,
            });

            const response = await request(app)
                .post("/auth/login")
                .send(loginUserData);

            expect(response.body).toHaveProperty("errors");
            expect(
                (response.body as Record<string, string>).errors.length,
            ).toBeGreaterThan(0);
        });
    });
});
