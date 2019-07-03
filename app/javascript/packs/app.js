import Vue from 'vue'

const Api = require('./api')

document.addEventListener("DOMContentLoaded", () => {
  var app = new Vue({
    el: '#app',
    components: {
      'task': {
                props: ['task'],
                template: `
                <div class="ui segment task"
                    v-bind:class="task.completed ? 'done' : 'todo' ">
                    <div class="ui grid">
                        <div class="left floated twelve wide column">
                            <div class="ui checkbox">
                              <input type="checkbox" name="task" v-on:click="$parent.toggleDone($event, task.id)" :checked="task.completed">
                              <label>{{task.name}} <span class="description">{{task.description}}</span></label>
                            </div>
                        </div>
                        <div class="right floated three wide column">
                            <i class="icon pencil blue" alt="edit" v-on:click="$parent.editTask($event, task.id)"></i>
                            <i class="icon trash red" alt="delete" v-on:click="$parent.deleteTask($event, task.id)"></i>
                        </div>
                    </div>
                </div>
              `
              }
    },
    data: {
      tasks: [],
      task: {},
      message: '',
      action: 'create'
    },
    computed: {
      completedTasks: function() {
        return this.tasks.filter( item => item.completed == true );
      },
      todoTasks: function() {
        return this.tasks.filter( item => item.completed == false);
      },
      nextId: function(){
        return (this.tasks.sort(function(a,b){ return a.id - b.id; }))[this.tasks.length - 1].id + 1;
      }
    },
    methods: {
      listTasks: function() {
        Api.listTasks().then(function(response){
          app.tasks = response;
        })
      },
      toggleDone: function(event, id) {
        event.stopImmediatePropagation()

        let task = this.tasks.find(item => item.id == id)
        if (task) {
          task.completed = !task.completed
          this.message = `Task ${id} updated`
        }
      },
      createTask: function(event) {
        if(!this.task.completed){
          this.task.completed = false;
        } else {
          this.task.completed = true;
        }
        Api.createTask(this.task).then(function(response){
          app.listTasks();
          app.clear();
          app.message = `Task ${response.id} created.`
        })
      },
      editTask: function(event, id) {
        event.stopImmediatePropagation()

        this.action = 'edit'
        let task = this.tasks.find(item => item.id == id)
        if (task) {
          this.task = { id: task.id, name: task.name, description: task.description, completed: task.completed }
        }
      },
      updateTask: function(event, id) {
        event.stopImmediatePropagation()
        event.preventDefault()

        let task = this.tasks.find(item => item.id == id)

        if (task) {
          task.name = this.task.name
          task.description = this.task.description
          task.completed = this.task.completed
        }
      },
      deleteTask: function(event, id) {
        event.stopImmediatePropagation()

        let taskIndex = this.tasks.findIndex(item => item.id == id)

        if (taskIndex >= 0) {
          this.$delete(this.tasks, taskIndex)
        }
      },
      clear: function() {
        this.task = {}
        this.action = 'create'
        this.message = ''
      }
    },
    beforeMount() { this.listTasks() }
  })
})
