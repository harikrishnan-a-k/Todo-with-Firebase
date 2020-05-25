//redirect if not valid login
let currentUser=JSON.parse(window.localStorage.getItem('user'));
if(!currentUser){
    window.location='index.html';

}

// setting welcome text
document.querySelector('#welcomeText').innerHTML=`Welcome ${currentUser.displayName}`;

// code for logout.
document.querySelector('#logout').addEventListener('click',()=>{
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.localStorage.removeItem('user');
        window.location="index.html";
        console.log('logout successfully');
        
      }).catch(function(error) {
        // An error happened.
        console.log('logout error',error);
      });
    });
    

// code for saving list to firestore

document.querySelector('#save').addEventListener('click',(e)=>{
    const title=$('#todoTitle1').html();
    let todoString='';
    const lis=document.querySelectorAll('#list1 li .todo');
    lis.forEach((li)=>{
        let lival=li.innerText;
        lival+=li.classList.contains('completed')===true?'T':'F';
        lival+=';';
        todoString+=lival;
    });
    const db=firebase.firestore();
    // Add a new document with a random generated id.
    db.collection("todos").add({
        email: currentUser.email,
        listName:title,
        listString:todoString,
        time:firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });

});

// fetching and displaying available lists of a user.

document.addEventListener('DOMContentLoaded',(event)=>{
  
    const db=firebase.firestore();
    const myList=db.collection('todos').where("email","==",currentUser.email).orderBy('time','desc').onSnapshot(function(querySnapshot) {
        $('#list3').html('');
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id,'created on',new Date(doc.data().time.seconds*1000), " => ", doc.data());
            let datestr=new Date(doc.data().time.seconds*1000).toString();
            let datestrModified=datestr.slice(0,datestr.indexOf('GMT'));
            $('#list3').append(`<li class="pl-3" data-id=${doc.id}> <span class="darkBlue font-weight-bold mr-3"> ${doc.data().listName} </span> <span> created on ${datestrModified} </span> </li>`);
        });
    });
    

});

// showing selected list on clicking list from your lists
$(document).on('click','#list3 li',function(e){
    const db=firebase.firestore();
    let id=this.dataset.id;
    db.collection('todos').doc(id).get()
    .then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            $('#todoTitle2').html(doc.data().listName);
            let todos=doc.data().listString.split(';');
            todos.pop();
            $('#list2').html('');
            $('#list2').attr('data-id',id);
            todos.forEach(function(todo){
                let completed=todo[todo.length-1]==='T'?'completed':'';
                $('#list2').append(`<li><span class="delete"><i class="fas fa-trash-alt"></i></span> <span class="todo text-capitalize ${completed}">${todo.slice(0,-1)}</span> </li>`);

            });
            $( "#tabs" ).tabs( "option", "active", 1 );
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    

});

// code to delete selected list
$('#delete').on('click',function(e){
    let listId=$('#list2').attr('data-id');
    const db=firebase.firestore();
    db.collection("todos").doc(listId).delete().then(function() {
        console.log("Document successfully deleted!");
        alert('Document successfully deleted!');
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
});

// code to update selected list
$('#update').on('click',function(e){
    let listId=$('#list2').attr('data-id');
    let title1=$('#todoTitle2').html();
    let todoString='';
    const lis=document.querySelectorAll('#list2 li .todo');
    lis.forEach((li)=>{
        let lival=li.innerText;
        lival+=li.classList.contains('completed')===true?'T':'F';
        lival+=';';
        todoString+=lival;
    });
    const db=firebase.firestore();
    db.collection("todos").doc(listId).update({
        listName:title1,
        listString:todoString
    })
    .then(function() {
        console.log("Document successfully updated!");
        alert('Document successfully updated!');
    })
    .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
        alert("Error updating document: probably document dosent exist ", error);
    });

})

// adding sortable drag and drop functionality     lalalalla
$( function() {
    $( "#list1" ).sortable();
    $( "#list1" ).disableSelection();
  } );
$( function() {
    $( "#list2" ).sortable();
    $( "#list2" ).disableSelection();
  } );



// marking completed todos with linethrough and green color when clicked. and toggles on next click
$('.listContainer ul.demo').on('click','span.todo',function(e){
    $(this).toggleClass('completed');
});

// deleting todo when clicking on delete button
$('.listContainer ul.demo').on('click','span.delete',function(e){
    e.stopPropagation();
    $(this).parent().fadeOut(1000,function(e){
        $(this).remove();
    })
});
// adding new <li> on enter keypress
$('#inputText1').keypress(function(e){
    if(e.which===13){
        let text=$(this).val();
        $(this).next().append(`<li><span class="delete"><i class="fas fa-trash-alt"></i></span> <span class="todo text-capitalize">${text}</span> </li>`);
        $(this).val('');
        // let liHeight=$('.listContainer ul li:last-child').outerHeight()
        //  $('.listContainer ul li:last-child .delete').css('height',`${liHeight}px`);
    }
})
$('#inputText2').keypress(function(e){
    if(e.which===13){
        let text=$(this).val();
        $(this).next().append(`<li><span class="delete"><i class="fas fa-trash-alt"></i></span> <span class="todo text-capitalize">${text}</span> </li>`);
        $(this).val('');
        // let liHeight=$('.listContainer ul li:last-child').outerHeight()
        //  $('.listContainer ul li:last-child .delete').css('height',`${liHeight}px`);
    }
})

//toggle inputText on clicking pencil icon
$('.addButton').on('click',function(){
    console.log($(this).parent().next()[0]);
    $(this).parent().next().fadeToggle(800);
})

//toggle todoList title to input for changing when click on it 
$(function () {
    $(document).on('click', 'span#todoTitle1', function () {
        var input = $('<input />', {
            'type': 'text',
                'name': 'unique',
                'id':'todoTitleInput1',
                'value': $(this).html()
        });
        $(this).parent().append(input);
        $(this).remove();
        input.focus();
    });
    $(document).on('click', 'span#todoTitle2', function () {
        var input = $('<input />', {
            'type': 'text',
                'name': 'unique',
                'id':'todoTitleInput2',
                'value': $(this).html()
        });
        $(this).parent().append(input);
        $(this).remove();
        input.focus();
    });

    $(document).on('blur', 'input#todoTitleInput1', function () {
        $(this).parent().append($('<span />').attr('id','todoTitle1').html($(this).val()));
        $(this).remove();
    });
    $(document).on('blur', 'input#todoTitleInput2', function () {
        $(this).parent().append($('<span />').attr('id','todoTitle2').html($(this).val()));
        $(this).remove();
    });
});
// delete button toggle for mobile because hover css do not work for mobile
$(function(){
    if($(window).width()<600){
        console.log('mobile script runs...');
        $(document).on('click','.listContainer ul li',function(){
            $(this).children('.delete').toggleClass('deleteMobileStyles');
        });
    }
    
})