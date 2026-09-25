//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'employee_account_response_dto_output.g.dart';

/// EmployeeAccountResponseDtoOutput
///
/// Properties:
/// * [id] 
/// * [username] 
/// * [contactEmail] 
/// * [role] 
/// * [status] 
/// * [credentialDeliveryPending] 
/// * [createdAt] 
/// * [updatedAt] 
@BuiltValue()
abstract class EmployeeAccountResponseDtoOutput implements Built<EmployeeAccountResponseDtoOutput, EmployeeAccountResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'username')
  String get username;

  @BuiltValueField(wireName: r'contactEmail')
  String? get contactEmail;

  @BuiltValueField(wireName: r'role')
  EmployeeAccountResponseDtoOutputRoleEnum get role;
  // enum roleEnum {  DRIVER,  TICKET_STAFF,  SUPPORT_STAFF,  };

  @BuiltValueField(wireName: r'status')
  EmployeeAccountResponseDtoOutputStatusEnum get status;
  // enum statusEnum {  ACTIVE,  LOCKED,  DISABLED,  };

  @BuiltValueField(wireName: r'credentialDeliveryPending')
  bool get credentialDeliveryPending;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  EmployeeAccountResponseDtoOutput._();

  factory EmployeeAccountResponseDtoOutput([void updates(EmployeeAccountResponseDtoOutputBuilder b)]) = _$EmployeeAccountResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(EmployeeAccountResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<EmployeeAccountResponseDtoOutput> get serializer => _$EmployeeAccountResponseDtoOutputSerializer();
}

class _$EmployeeAccountResponseDtoOutputSerializer implements PrimitiveSerializer<EmployeeAccountResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [EmployeeAccountResponseDtoOutput, _$EmployeeAccountResponseDtoOutput];

  @override
  final String wireName = r'EmployeeAccountResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EmployeeAccountResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'username';
    yield serializers.serialize(
      object.username,
      specifiedType: const FullType(String),
    );
    yield r'contactEmail';
    yield object.contactEmail == null ? null : serializers.serialize(
      object.contactEmail,
      specifiedType: const FullType.nullable(String),
    );
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(EmployeeAccountResponseDtoOutputRoleEnum),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(EmployeeAccountResponseDtoOutputStatusEnum),
    );
    yield r'credentialDeliveryPending';
    yield serializers.serialize(
      object.credentialDeliveryPending,
      specifiedType: const FullType(bool),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'updatedAt';
    yield serializers.serialize(
      object.updatedAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    EmployeeAccountResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EmployeeAccountResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'username':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.username = valueDes;
          break;
        case r'contactEmail':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.contactEmail = valueDes;
          break;
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(EmployeeAccountResponseDtoOutputRoleEnum),
          ) as EmployeeAccountResponseDtoOutputRoleEnum;
          result.role = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(EmployeeAccountResponseDtoOutputStatusEnum),
          ) as EmployeeAccountResponseDtoOutputStatusEnum;
          result.status = valueDes;
          break;
        case r'credentialDeliveryPending':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.credentialDeliveryPending = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'updatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.updatedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  EmployeeAccountResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = EmployeeAccountResponseDtoOutputBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


class EmployeeAccountResponseDtoOutputRoleEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRIVER')
  static const EmployeeAccountResponseDtoOutputRoleEnum DRIVER = _$employeeAccountResponseDtoOutputRoleEnum_DRIVER;
  @BuiltValueEnumConst(wireName: r'TICKET_STAFF')
  static const EmployeeAccountResponseDtoOutputRoleEnum TICKET_STAFF = _$employeeAccountResponseDtoOutputRoleEnum_TICKET_STAFF;
  @BuiltValueEnumConst(wireName: r'SUPPORT_STAFF')
  static const EmployeeAccountResponseDtoOutputRoleEnum SUPPORT_STAFF = _$employeeAccountResponseDtoOutputRoleEnum_SUPPORT_STAFF;

  static Serializer<EmployeeAccountResponseDtoOutputRoleEnum> get serializer => _$employeeAccountResponseDtoOutputRoleEnumSerializer;

  const EmployeeAccountResponseDtoOutputRoleEnum._(String name): super(name);

  static BuiltSet<EmployeeAccountResponseDtoOutputRoleEnum> get values => _$employeeAccountResponseDtoOutputRoleEnumValues;
  static EmployeeAccountResponseDtoOutputRoleEnum valueOf(String name) => _$employeeAccountResponseDtoOutputRoleEnumValueOf(name);
}

class EmployeeAccountResponseDtoOutputStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const EmployeeAccountResponseDtoOutputStatusEnum ACTIVE = _$employeeAccountResponseDtoOutputStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'LOCKED')
  static const EmployeeAccountResponseDtoOutputStatusEnum LOCKED = _$employeeAccountResponseDtoOutputStatusEnum_LOCKED;
  @BuiltValueEnumConst(wireName: r'DISABLED')
  static const EmployeeAccountResponseDtoOutputStatusEnum DISABLED = _$employeeAccountResponseDtoOutputStatusEnum_DISABLED;

  static Serializer<EmployeeAccountResponseDtoOutputStatusEnum> get serializer => _$employeeAccountResponseDtoOutputStatusEnumSerializer;

  const EmployeeAccountResponseDtoOutputStatusEnum._(String name): super(name);

  static BuiltSet<EmployeeAccountResponseDtoOutputStatusEnum> get values => _$employeeAccountResponseDtoOutputStatusEnumValues;
  static EmployeeAccountResponseDtoOutputStatusEnum valueOf(String name) => _$employeeAccountResponseDtoOutputStatusEnumValueOf(name);
}

