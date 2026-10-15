package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"github.com/stripe/stripe-go/v86"
	/*"github.com/stripe/stripe-go/v86/webhook"*/
)

/*var mapita := make(map[string]int)*/
/*mapita["Ana"] = 25*/
/*item, err := mapita["Mondongo"]*/
/*delete(mapita, "Ana")*/
/*clear(mapita)*/
var stripeClient *stripe.Client 
var addr = ":8000"
var domain = "https://nscristiandad.es"

type FileSystemExt struct {
	http.FileSystem
}

func (fs FileSystemExt) Open(name string) (http.File, error) {
	file, err := fs.FileSystem.Open(name)
	if file == nil {
		file, err = fs.FileSystem.Open(name + ".html")
		if file == nil {
			file, err = fs.FileSystem.Open("/404.html")
		}
	}
	return file, err
}

func checkout(w http.ResponseWriter, r *http.Request) {
	r.ParseForm() 

	checkoutParams := &stripe.CheckoutSessionCreateParams{
		Mode: stripe.String(stripe.CheckoutSessionModeSubscription),
		LineItems: []*stripe.CheckoutSessionCreateLineItemParams{
			{
				Price:    stripe.String(r.PostFormValue("price")),
				Quantity: stripe.Int64(1),
			},
		},
		/*SuccessURL: stripe.String(domain + "/success.html?session_id={CHECKOUT_SESSION_ID}"),*/
		SuccessURL: stripe.String(domain + "/success"),
	}

	s, _ := stripeClient.V1CheckoutSessions.Create(context.TODO(), checkoutParams)
	http.Redirect(w, r, s.URL, http.StatusSeeOther)
}

func cancel(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	_, err := stripeClient.V1Subscriptions.Cancel(context.TODO(), r.PostFormValue("id"), &stripe.SubscriptionCancelParams{})
	if err == nil {
		log.Println("Ha sido cancelada la suscripción:", r.PostFormValue("id"))
	}
}

func main() {
	stripeClient = stripe.NewClient(os.Getenv("STRIPE_API_KEY")) 

	http.Handle("/", http.FileServer(FileSystemExt{http.Dir("output")}))
	http.HandleFunc("POST /checkout", checkout)
	http.HandleFunc("POST /cancel", cancel)

	log.Printf("Escuchando en %s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
