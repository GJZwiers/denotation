const response = new Response(new TextEncoder().encode("Hello World!\n"));

const reader = response.body?.getReader();

const readable = new ReadableStream({
  start(controller) {
    function push() {
      reader?.read().then(({ done, value }) => {
        if (done) {
          console.log("done");
          return controller.close();
        }

        controller.enqueue(value);
        console.log(done, value);
        push();
      });
    }
    push();
  },
});

await readable.pipeTo(Deno.stdout.writable);
