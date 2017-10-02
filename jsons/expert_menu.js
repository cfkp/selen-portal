{
    "_id": ObjectId("58f5173ec712876d64247bf9"),
    "name": "expert_menu",
    "title": "Меню эксперта",
    "data": {
        "name": "expert_menu",
        "title": "Меню клиента",
        "root_menu": "#top_menu",
        "items": [
            {
                "name": "menu_person_request",
                "title": "Заявка",
                "root_menu": "#left_menu",
                "active": true,
                "items": [
                    {
                        "title": "Новые заявки",
                        "meta_action_type": "view",
                        "meta_class": "person_request",
                        "meta_view": "vw_new_persrequests",
                        "active": true
                    },
                    {
                        "title": "Заявки на исполнении",
                        "meta_action_type": "view",
                        "meta_class": "person_request",
                        "meta_view": "vw_expert_persrequests"
                    },
                    {
                        "title": "Продукты цфкп ",
                        "meta_action_type": "view",
                        "meta_class": "cfkp_product",
                        "meta_view": "vw_cfkp_product"
                    }
                ]
            },
            {
                "name": "user_menu",
                "title": "Данные пользователя",
                "root_menu": "#left_menu",
                "items": [
                    {
                        "title": "Мои данные",
                        "meta_action_type": "view",
                        "meta_class": "users",
                        "meta_view": "vw_user_property",
                        "active": true
                    },
                    {
                        "title": "Изменить пароль",
                        "meta_action_type": "method",
                        "meta_class": "users",
                        "meta_method": "user_change_pass"
                    }
                ]
            }
        ]
    }
}