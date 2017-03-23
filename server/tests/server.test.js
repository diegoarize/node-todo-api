const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  text: "First test todo",
  _id: "58d316af3b28d2801f60a6ba"
}, {
  text: 'second test todo'
}]

beforeEach(function (done) {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  })
    .then(() => done());
});

describe('POST /todos', function () {
  it('Should create a new todo', function (done) {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(err => done(err));
      });
  });

  it('should not create todo with invalid body data', function (done) {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        Todo.find().then(todos => {
          expect(todos.length === 2);
          done();
        }).catch(err => done(err));
      });
  });
});

describe('GET /todos', function () {
  it('should get all todos', function (done) {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});


describe('GET /todos/:id', function () {
  it('should return an emty body and status 404 for an invalid id', function (done) {
    request(app)
      .get('/todos/1g2g1h')
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should return a valid todo when id matches', function (done) {
    request(app)
    .get('/todos/58d316af3b28d2801f60a6ba')
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toEqual("First test todo");
    })
    .end(done);
  });

  it('Should return 404 and empty body when todo not found', (done) => {
    request(app)
    .get('/todos/48d316af3b28d2801f60a6ba')
    .expect(404)
    .expect((res) => {
      expect(res.body).toEqual({});
    })
    .end(done);
  });
});
